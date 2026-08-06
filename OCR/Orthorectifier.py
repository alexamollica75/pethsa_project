from typing import Any
import cv2
import numpy as np
from numpy.typing import NDArray

ImageArray = NDArray[np.uint8]


DEFAULT_ORTHORECTIFICATION_CONFIG: dict[str, Any] = {
    "detection_max_dimension": 1800,
    "minimum_document_area_ratio": 0.20,
    "contour_epsilon_ratio": 0.02,
    "canny_low": 50,
    "canny_high": 160,
    "maximum_skew_degrees": 15.0,
    "adaptive_block_size": 31,
    "adaptive_c": 13,
    "border_size": 12,
    "use_binary_image_for_ocr": False,
}


def merge_orthorectification_config(
    config: dict[str, Any] | None,
) -> dict[str, Any]:
    return {
        **DEFAULT_ORTHORECTIFICATION_CONFIG,
        **(config or {}),
    }


def validate_image(image: ImageArray) -> None:
    if not isinstance(image, np.ndarray):
        raise TypeError("image must be a NumPy array.")

    if image.size == 0:
        raise ValueError("image cannot be empty.")

    if image.ndim not in (2, 3):
        raise ValueError("image must be grayscale, BGR, or BGRA.")

    if image.ndim == 3 and image.shape[2] not in (3, 4):
        raise ValueError(
            "image must contain 3 BGR channels or 4 BGRA channels."
        )


def to_grayscale(image: ImageArray) -> ImageArray:
    if image.ndim == 2:
        return image.copy()

    if image.shape[2] == 4:
        return cv2.cvtColor(
            image,
            cv2.COLOR_BGRA2GRAY,
        )

    return cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY,
    )


def resize_for_detection(
    image: ImageArray,
    maximum_dimension: int,
) -> tuple[ImageArray, float]:
    height, width = image.shape[:2]
    largest_dimension = max(height, width)

    if largest_dimension <= maximum_dimension:
        return image.copy(), 1.0

    scale = maximum_dimension / float(largest_dimension)

    resized_image = cv2.resize(
        image,
        None,
        fx=scale,
        fy=scale,
        interpolation=cv2.INTER_AREA,
    )

    return resized_image, scale


def order_corner_points(
    points: NDArray[np.float32],
) -> NDArray[np.float32]:
    ordered_points = np.zeros(
        (4, 2),
        dtype=np.float32,
    )

    point_sums = points.sum(axis=1)

    point_differences = np.diff(
        points,
        axis=1,
    ).reshape(-1)

    ordered_points[0] = points[
        np.argmin(point_sums)
    ]

    ordered_points[1] = points[
        np.argmin(point_differences)
    ]

    ordered_points[2] = points[
        np.argmax(point_sums)
    ]

    ordered_points[3] = points[
        np.argmax(point_differences)
    ]

    return ordered_points


def is_reasonable_document_shape(
    points: NDArray[np.float32],
    image_width: int,
    image_height: int,
) -> bool:
    ordered_points = order_corner_points(points)

    (
        top_left,
        top_right,
        bottom_right,
        bottom_left,
    ) = ordered_points

    top_width = np.linalg.norm(
        top_right - top_left
    )

    bottom_width = np.linalg.norm(
        bottom_right - bottom_left
    )

    left_height = np.linalg.norm(
        bottom_left - top_left
    )

    right_height = np.linalg.norm(
        bottom_right - top_right
    )

    document_width = max(
        top_width,
        bottom_width,
    )

    document_height = max(
        left_height,
        right_height,
    )

    if document_width < image_width * 0.25:
        return False

    if document_height < image_height * 0.25:
        return False

    aspect_ratio = document_width / max(
        document_height,
        1.0,
    )

    return 0.20 <= aspect_ratio <= 5.0


def detect_document_corners(
    image: ImageArray,
    config: dict[str, Any],
) -> NDArray[np.float32] | None:
    resized_image, scale = resize_for_detection(
        image=image,
        maximum_dimension=int(
            config["detection_max_dimension"]
        ),
    )

    grayscale = to_grayscale(
        resized_image
    )

    contrast_enhancer = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8),
    )

    enhanced_image = contrast_enhancer.apply(
        grayscale
    )

    blurred_image = cv2.GaussianBlur(
        enhanced_image,
        (5, 5),
        0,
    )

    edge_image = cv2.Canny(
        blurred_image,
        int(config["canny_low"]),
        int(config["canny_high"]),
    )

    closing_kernel = cv2.getStructuringElement(
        cv2.MORPH_RECT,
        (5, 5),
    )

    closed_edges = cv2.morphologyEx(
        edge_image,
        cv2.MORPH_CLOSE,
        closing_kernel,
        iterations=2,
    )

    contour_result = cv2.findContours(
        closed_edges,
        cv2.RETR_LIST,
        cv2.CHAIN_APPROX_SIMPLE,
    )

    contours = contour_result[-2]

    contours = sorted(
        contours,
        key=cv2.contourArea,
        reverse=True,
    )

    resized_height, resized_width = (
        resized_image.shape[:2]
    )

    resized_area = float(
        resized_height * resized_width
    )

    minimum_document_area = (
        resized_area
        * float(
            config[
                "minimum_document_area_ratio"
            ]
        )
    )

    epsilon_ratios = (
        float(config["contour_epsilon_ratio"]),
        0.03,
        0.05,
        0.08,
    )

    for contour in contours[:25]:
        contour_area = cv2.contourArea(
            contour
        )

        if contour_area < minimum_document_area:
            continue

        perimeter = cv2.arcLength(
            contour,
            True,
        )

        # A photographed receipt often has creases/folds that add extra
        # bumps to its outline, so one fixed epsilon can fail to collapse
        # it to a clean quadrilateral. Try a few increasingly permissive
        # epsilons before giving up on this contour.
        polygon = None

        for epsilon_ratio in epsilon_ratios:
            candidate = cv2.approxPolyDP(
                contour,
                epsilon_ratio * perimeter,
                True,
            )

            if len(candidate) == 4:
                polygon = candidate
                break

        if polygon is None:
            continue

        if not cv2.isContourConvex(polygon):
            continue

        corner_points = polygon.reshape(
            4,
            2,
        ).astype(np.float32)

        corner_points /= scale

        if not is_reasonable_document_shape(
            points=corner_points,
            image_width=image.shape[1],
            image_height=image.shape[0],
        ):
            continue

        return order_corner_points(
            corner_points
        )

    return None


def apply_perspective_transform(
    image: ImageArray,
    corner_points: NDArray[np.float32],
) -> ImageArray:
    (
        top_left,
        top_right,
        bottom_right,
        bottom_left,
    ) = order_corner_points(corner_points)

    top_width = np.linalg.norm(
        top_right - top_left
    )

    bottom_width = np.linalg.norm(
        bottom_right - bottom_left
    )

    output_width = max(
        1,
        int(
            round(
                max(
                    top_width,
                    bottom_width,
                )
            )
        ),
    )

    left_height = np.linalg.norm(
        bottom_left - top_left
    )

    right_height = np.linalg.norm(
        bottom_right - top_right
    )

    output_height = max(
        1,
        int(
            round(
                max(
                    left_height,
                    right_height,
                )
            )
        ),
    )

    destination_points = np.array(
        [
            [0, 0],
            [output_width - 1, 0],
            [
                output_width - 1,
                output_height - 1,
            ],
            [0, output_height - 1],
        ],
        dtype=np.float32,
    )

    transform_matrix = cv2.getPerspectiveTransform(
        np.array(
            [
                top_left,
                top_right,
                bottom_right,
                bottom_left,
            ],
            dtype=np.float32,
        ),
        destination_points,
    )

    return cv2.warpPerspective(
        image,
        transform_matrix,
        (
            output_width,
            output_height,
        ),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE,
    )


def estimate_skew_correction(
    image: ImageArray,
    maximum_skew_degrees: float,
) -> float:
    grayscale = to_grayscale(image)

    blurred_image = cv2.GaussianBlur(
        grayscale,
        (3, 3),
        0,
    )

    edge_image = cv2.Canny(
        blurred_image,
        50,
        150,
        apertureSize=3,
    )

    detected_lines = cv2.HoughLinesP(
        edge_image,
        rho=1,
        theta=np.pi / 180.0,
        threshold=80,
        minLineLength=max(
            40,
            image.shape[1] // 10,
        ),
        maxLineGap=20,
    )

    if detected_lines is None:
        return 0.0

    horizontal_angles: list[float] = []

    for detected_line in detected_lines:
        coordinates = detected_line.reshape(-1)

        if coordinates.size != 4:
            continue

        x1, y1, x2, y2 = coordinates

        horizontal_distance = x2 - x1
        vertical_distance = y2 - y1

        if horizontal_distance == 0:
            continue

        line_angle = float(
            np.degrees(
                np.arctan2(
                    vertical_distance,
                    horizontal_distance,
                )
            )
        )

        if abs(line_angle) <= maximum_skew_degrees:
            horizontal_angles.append(
                line_angle
            )

    if not horizontal_angles:
        return 0.0

    median_angle = float(
        np.median(horizontal_angles)
    )

    correction_angle = -median_angle

    if (
        abs(correction_angle)
        > maximum_skew_degrees
    ):
        return 0.0

    return correction_angle


def rotate_image_without_clipping(
    image: ImageArray,
    angle: float,
) -> ImageArray:
    if abs(angle) < 0.05:
        return image.copy()

    height, width = image.shape[:2]

    center = (
        width / 2.0,
        height / 2.0,
    )

    rotation_matrix = cv2.getRotationMatrix2D(
        center,
        angle,
        1.0,
    )

    cosine = abs(
        rotation_matrix[0, 0]
    )

    sine = abs(
        rotation_matrix[0, 1]
    )

    output_width = int(
        height * sine
        + width * cosine
    )

    output_height = int(
        height * cosine
        + width * sine
    )

    rotation_matrix[0, 2] += (
        output_width / 2.0
        - center[0]
    )

    rotation_matrix[1, 2] += (
        output_height / 2.0
        - center[1]
    )

    return cv2.warpAffine(
        image,
        rotation_matrix,
        (
            output_width,
            output_height,
        ),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE,
    )


def crop_to_receipt_content(
    image: ImageArray,
) -> ImageArray:
    grayscale = to_grayscale(image)

    binary_image = cv2.threshold(
        grayscale,
        0,
        255,
        cv2.THRESH_BINARY_INV
        | cv2.THRESH_OTSU,
    )[1]

    content_kernel = cv2.getStructuringElement(
        cv2.MORPH_RECT,
        (7, 5),
    )

    content_mask = cv2.morphologyEx(
        binary_image,
        cv2.MORPH_CLOSE,
        content_kernel,
        iterations=2,
    )

    content_points = cv2.findNonZero(
        content_mask
    )

    if content_points is None:
        return image

    x, y, width, height = cv2.boundingRect(
        content_points
    )

    image_height, image_width = (
        image.shape[:2]
    )

    horizontal_padding = max(
        12,
        int(width * 0.02),
    )

    vertical_padding = max(
        12,
        int(height * 0.02),
    )

    x1 = max(
        0,
        x - horizontal_padding,
    )

    y1 = max(
        0,
        y - vertical_padding,
    )

    x2 = min(
        image_width,
        x + width + horizontal_padding,
    )

    y2 = min(
        image_height,
        y + height + vertical_padding,
    )

    cropped_image = image[
        y1:y2,
        x1:x2,
    ]

    if cropped_image.size == 0:
        return image

    return cropped_image


def remove_small_border(
    image: ImageArray,
    border_size: int,
) -> ImageArray:
    if border_size <= 0:
        return image

    height, width = image.shape[:2]

    if height <= border_size * 2:
        return image

    if width <= border_size * 2:
        return image

    return image[
        border_size:height - border_size,
        border_size:width - border_size,
    ]


def prepare_image_for_ocr(
    image: ImageArray,
    config: dict[str, Any],
) -> ImageArray:
    grayscale = to_grayscale(image)

    denoised_image = cv2.fastNlMeansDenoising(
        grayscale,
        None,
        h=7,
        templateWindowSize=7,
        searchWindowSize=21,
    )

    contrast_enhancer = cv2.createCLAHE(
        clipLimit=2.2,
        tileGridSize=(8, 8),
    )

    enhanced_image = contrast_enhancer.apply(
        denoised_image
    )

    if not bool(
        config["use_binary_image_for_ocr"]
    ):
        return enhanced_image

    block_size = int(
        config["adaptive_block_size"]
    )

    if block_size % 2 == 0:
        block_size += 1

    return cv2.adaptiveThreshold(
        enhanced_image,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        block_size,
        int(config["adaptive_c"]),
    )


def orthorectify_receipt(
    image: ImageArray,
    config: dict[str, Any] | None = None,
) -> dict[str, Any]:
    validate_image(image)

    resolved_config = (
        merge_orthorectification_config(
            config
        )
    )

    source_height, source_width = (
        image.shape[:2]
    )

    document_corners = (
        detect_document_corners(
            image=image,
            config=resolved_config,
        )
    )

    if document_corners is not None:
        corrected_image = (
            apply_perspective_transform(
                image=image,
                corner_points=document_corners,
            )
        )

        document_boundary_found = True
        rotation_degrees = 0.0

    else:
        rotation_degrees = (
            estimate_skew_correction(
                image=image,
                maximum_skew_degrees=float(
                    resolved_config[
                        "maximum_skew_degrees"
                    ]
                ),
            )
        )

        corrected_image = (
            rotate_image_without_clipping(
                image=image,
                angle=rotation_degrees,
            )
        )

        corrected_image = (
            crop_to_receipt_content(
                corrected_image
            )
        )

        document_boundary_found = False

    corrected_image = remove_small_border(
        image=corrected_image,
        border_size=int(
            resolved_config["border_size"]
        ),
    )

    ocr_image = prepare_image_for_ocr(
        image=corrected_image,
        config=resolved_config,
    )

    output_height, output_width = (
        corrected_image.shape[:2]
    )

    return {
        "corrected_image": corrected_image,
        "ocr_image": ocr_image,
        "metadata": {
            "document_boundary_found": (
                document_boundary_found
            ),
            "rotation_degrees": round(
                rotation_degrees,
                4,
            ),
            "source_width": int(
                source_width
            ),
            "source_height": int(
                source_height
            ),
            "output_width": int(
                output_width
            ),
            "output_height": int(
                output_height
            ),
        },
    }
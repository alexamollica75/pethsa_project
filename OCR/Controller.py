import json
import sys
from pathlib import Path
import cv2
import fitz  # PyMuPDF
import numpy as np
from numpy.typing import NDArray
from OCRSanner import OCRController
from Orthorectifier import orthorectify_receipt

ImageArray = NDArray[np.uint8]

# 3x zoom on PyMuPDF's default 72 DPI render ~= 216 DPI -- needed for
# dense tables with small text; the default is too low for reliable OCR.
PDF_RENDER_ZOOM = 3.0


def load_pdf_first_page(pdf_path: Path) -> ImageArray:
    """
    Rasterizes page 1 of a PDF into a BGR image array, so it can be
    handed to the same orthorectify/OCR pipeline as a photographed image.
    """
    document = fitz.open(str(pdf_path))

    if document.page_count == 0:
        raise ValueError(f"PDF has no pages: {pdf_path}")

    page = document.load_page(0)
    pixmap = page.get_pixmap(matrix=fitz.Matrix(PDF_RENDER_ZOOM, PDF_RENDER_ZOOM))

    channels = pixmap.n
    image = np.frombuffer(pixmap.samples, dtype=np.uint8).reshape(
        pixmap.height, pixmap.width, channels
    )

    if channels == 4:
        image = cv2.cvtColor(image, cv2.COLOR_RGBA2BGR)
    elif channels == 3:
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    elif channels == 1:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
    else:
        raise ValueError(f"Unexpected PDF pixmap channel count: {channels}")

    document.close()
    return image


def load_image_from_path(image_path: str | Path):
    resolved_path = Path(image_path).expanduser().resolve()

    if not resolved_path.exists():
        raise FileNotFoundError(f"Image was not found: {resolved_path}")

    if not resolved_path.is_file():
        raise ValueError(f"Path is not a file: {resolved_path}")

    if resolved_path.suffix.lower() == ".pdf":
        image = load_pdf_first_page(resolved_path)

        if image is None:
            raise ValueError(f"Unable to render PDF page: {resolved_path}")

        return image, resolved_path

    encoded_image = np.fromfile(str(resolved_path), dtype=np.uint8)
    image = cv2.imdecode(encoded_image, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError(f"Unable to decode image: {resolved_path}")

    return image, resolved_path


def save_image_to_path(image: ImageArray, output_path: str | Path):
    resolved_output_path = Path(output_path).expanduser().resolve()
    resolved_output_path.parent.mkdir(parents=True, exist_ok=True)

    extension = resolved_output_path.suffix.lower()
    if extension not in (".jpg", ".jpeg", ".png", ".webp"):
        raise ValueError("Output image must use JPEG, PNG, or WebP.")

    success, encoded_image = cv2.imencode(extension, image)
    if not success:
        raise RuntimeError(f"Unable to encode output image: {resolved_output_path}")

    encoded_image.tofile(str(resolved_output_path))
    return resolved_output_path


def build_output_paths(input_path: Path, output_directory: str | Path):
    resolved_output_directory = Path(output_directory).expanduser().resolve()
    resolved_output_directory.mkdir(parents=True, exist_ok=True)

    stem = input_path.stem
    return {
        "corrected_image": resolved_output_directory / f"{stem}_corrected.jpg",
        "ocr_ready_image": resolved_output_directory / f"{stem}_ocr_ready.jpg",
    }


def scan_receipt_from_path(image_path: str | Path, output_directory: str | Path):
    """
    Single-file orchestrator: load -> orthorectify -> OCR -> save intermediates -> return one dict.
    Accepts JPEG/PNG images or a PDF (page 1 is rasterized before processing).
    """
    image, resolved_input_path = load_image_from_path(image_path)
    source_height, source_width = image.shape[:2]

    orthorectification_result = orthorectify_receipt(
        image=image,
        config={"use_binary_image_for_ocr": False},
    )

    corrected_image = orthorectification_result["corrected_image"]
    ocr_ready_image = orthorectification_result["ocr_image"]

    ocr_result = OCRController(ocr_ready_image)

    output_paths = build_output_paths(resolved_input_path, output_directory)
    corrected_output_path = save_image_to_path(corrected_image, output_paths["corrected_image"])
    ocr_output_path = save_image_to_path(ocr_ready_image, output_paths["ocr_ready_image"])

    return {
        "input": {
            "path": str(resolved_input_path),
            "filename": resolved_input_path.name,
            "size_bytes": resolved_input_path.stat().st_size,
            "width": int(source_width),
            "height": int(source_height),
        },
        "processing": orthorectification_result["metadata"],
        "outputs": {
            "corrected_image": str(corrected_output_path),
            "ocr_ready_image": str(ocr_output_path),
        },
        "ocr": ocr_result,
    }


def main():

    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: Controller.py <image_or_pdf_path> [output_directory]"}))
        sys.exit(1)

    image_path = sys.argv[1]
    output_directory = sys.argv[2] if len(sys.argv) > 2 else "processed"

    try:
        result = scan_receipt_from_path(image_path, output_directory)
    except Exception as error:
        print(json.dumps({"error": str(error)}))
        sys.exit(1)

    print(json.dumps(result))


if __name__ == "__main__":
    main()
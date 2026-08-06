import statistics

# Minimum confidence required to accept an OCR result
CONFIDENCE_THRESHOLD = 0.80


def needs_retry(confidence: float) -> bool:
    """
    Returns True if this OCR result should be rescanned.
    """
    return confidence < CONFIDENCE_THRESHOLD


def evaluate_word(confidence: float) -> str:
    """
    Returns a quality label for a single OCR result.
    """

    if confidence >= 0.95:
        return "Excellent"

    if confidence >= 0.85:
        return "Good"

    if confidence >= 0.70:
        return "Fair"

    return "Poor"


def overall_confidence(results) -> float:
    """
    Calculates the average confidence for the entire OCR pass.
    """

    if not results:
        return 0.0

    confidences = [
        confidence
        for _, _, confidence in results
    ]

    return round(statistics.mean(confidences), 4)


def find_low_confidence(results, threshold=CONFIDENCE_THRESHOLD):
    low = []

    for box, text, confidence in results:

        if confidence < threshold:

            low.append({
                "box": box,
                "text": text,
                "confidence": confidence
            })

    return low


def evaluate_page(results):
    """
    Returns a confidence summary for the OCR page.
    """

    summary = {
        "Excellent": 0,
        "Good": 0,
        "Fair": 0,
        "Poor": 0
    }

    for _, _, confidence in results:
        label = evaluate_word(confidence)
        summary[label] += 1

    summary["overall"] = overall_confidence(results)

    return summary
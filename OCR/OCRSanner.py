import re
import easyocr
import config
import cv2
import confidenceAnalysis
from confidenceAnalysis import find_low_confidence, evaluate_page
import paddleocr
from paddleocr import PaddleOCR

lang = "en"
reader = easyocr.Reader([lang],gpu=False)
paddle_reader = PaddleOCR( lang=lang, use_angle_cls=True
)
def paddleScanning(image, box, easy_confidence, paddle_reader, scale=3):

    x1 = int(min(p[0] for p in box))
    y1 = int(min(p[1] for p in box))
    x2 = int(max(p[0] for p in box))
    y2 = int(max(p[1] for p in box))

    crop = image[y1:y2, x1:x2]

    if crop.size == 0:
        return None, easy_confidence

    crop = cv2.resize(crop, None, fx=scale, fy=scale)

    if crop.ndim == 2:
        crop = cv2.cvtColor(crop, cv2.COLOR_GRAY2BGR)

    result = paddle_reader.ocr(crop)

    if not result or not result[0]:
        return None, easy_confidence

    paddle_text = result[0][0][1][0]
    paddle_conf = result[0][0][1][1]

    if paddle_conf > easy_confidence:
        return paddle_text, paddle_conf

    return None, easy_confidence


def refine_low_confidence_results(image, results, threshold=0.80):
    """
    Re-reads every low-confidence EasyOCR detection through PaddleOCR and
    keeps whichever engine did better -- this is where the two engines'
    results actually get combined. Must run BEFORE group_rows/extraction,
    since anything read after grouping never reaches the final output.
    """
    refined = []

    for box, text, confidence in results:

        if confidence < threshold:
            paddle_text, paddle_confidence = paddleScanning(
                image, box, confidence, paddle_reader
            )

            if paddle_text is not None and paddle_confidence > confidence:
                refined.append((box, paddle_text, paddle_confidence))
                continue

        refined.append((box, text, confidence))

    return refined


def OCRController(image):
    """
    Main OCR pipeline: EasyOCR -> PaddleOCR refinement -> row grouping ->
    field extraction.
    """
    raw_results = read_receipt(image)
    refined_results = refine_low_confidence_results(image, raw_results)

    rows = group_rows(refined_results)
    page_summary = evaluate_page(refined_results)

    header = extract_header(rows)
    patient = extract_patient(rows)
    invoice = extract_invoice(rows)
    items = extract_items(rows)
    items = classify_items(items)
    totals = extract_totals(rows)
    payment = extract_payment(rows)
    return build_dictionary(
        header, patient, invoice, items, totals, payment, debug_rows=rows,
    )


def read_receipt(image):
    """
    Runs EasyOCR.
    """

    return reader.readtext(
        image,
        detail=1,
        paragraph=False,
    )


def group_rows(results):
    """
    Groups OCR words into text rows.
    """

    words = []

    for box, text, confidence in results:

        x = min(point[0] for point in box)
        y = min(point[1] for point in box)

        words.append({
            "x": x,
            "y": y,
            "text": normalize_text(text)
        })

    words.sort(key=lambda w: w["y"])

    tolerance = 12

    grouped = []

    for word in words:

        if not grouped:

            grouped.append({
                "y": word["y"],
                "words": [word]
            })

            continue

        current = grouped[-1]

        if abs(word["y"] - current["y"]) <= tolerance:

            current["words"].append(word)

        else:

            grouped.append({
                "y": word["y"],
                "words": [word]
            })

    rows = []

    for group in grouped:

        group["words"].sort(key=lambda w: w["x"])

        line = " ".join(
            word["text"]
            for word in group["words"]
        )

        rows.append(line.strip())

    return rows


def normalize_text(text):
    replacements = {
        "|": "I",
        "§": "S",
        "¢": "c",
        "™": "",
        "®": "",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)

    text = re.sub(r"\s+", " ", text)

    return text.strip()


def clean_number(value):

    value = value.replace("$", "")
    value = value.replace("O", "0")
    value = value.replace("o", "0")
    value = value.replace("S", "5")

    # This OCR engine consistently misreads a decimal point as a comma
    # (e.g. "458,65" for "458.65", "16,800" for "16.800"). A single
    # comma followed by 1-3 digits, with no real decimal point already
    # present, is almost certainly that misread -- not a thousands
    # separator -- so convert it instead of stripping it.
    if value.count(",") == 1 and "." not in value:
        comma_index = value.index(",")
        if len(value) - comma_index - 1 <= 3:
            value = value[:comma_index] + "." + value[comma_index + 1:]

    value = value.replace(",", "")  # any comma left over: a real thousands separator

    value = re.sub(
        r"[^0-9.]",
        "",
        value,
    )

    if value.count(".") > 1:

        first = value.find(".")

        value = (
            value[:first + 1]
            + value[first + 1:].replace(".", "")
        )

    try:
        return float(value)

    except:
        return None


def extract_header(rows):
    """
    Hospital, invoice number and date.
    """

    header = {
        "hospital": None,
        "invoice_number": None,
        "date": None,
    }

    date_pattern = re.compile(
        r"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}"
    )

    for line in rows[:15]:

        lower = line.lower()

        if (
            header["hospital"] is None
            and (
                "veterinary" in lower
                or "animal hospital" in lower
                or "animal clinic" in lower
            )
        ):
            # Printed hospital names are typically all-caps on these
            # receipts, while OCR-garbled noise (e.g. "cNetbeMm") is
            # mixed-case -- walk out from the keyword and keep only
            # consecutive uppercase tokens, dropping garbled neighbors.
            words = line.split()
            keyword_idx = next(
                (
                    i for i, w in enumerate(words)
                    if re.search(r"HOSPITAL|CLINIC|VETERINARY", w, re.IGNORECASE)
                ),
                None,
            )

            if keyword_idx is not None:
                start = keyword_idx
                while start > 0 and words[start - 1].isupper():
                    start -= 1

                end = keyword_idx + 1
                while end < len(words) and words[end].isupper():
                    end += 1

                header["hospital"] = " ".join(words[start:end])
            else:
                header["hospital"] = line

        if (
            header["invoice_number"] is None
            and (
                "invoice" in lower
                or "receipt" in lower
            )
        ):

            match = re.search(
                r"[A-Za-z0-9-]+$",
                line,
            )

            if match:
                header["invoice_number"] = match.group()

        if header["date"] is None:

            match = date_pattern.search(line)

            if match:
                header["date"] = match.group()

    return header


def extract_patient(rows):
    """
    Owner and patient information.
    """

    patient = {
        "owner": None,
        "patient": None,
        "species": None,
        "breed": None,
        "gender": None,
        "weight": None,
    }

    for line in rows:

        lower = line.lower()

        if patient["owner"] is None:

            if "owner" in lower or lower.startswith("client"):

                patient["owner"] = line.split(":")[-1].strip()

        if patient["patient"] is None:

            if lower.startswith("pet") or lower.startswith("patient"):

                patient["patient"] = line.split(":")[-1].strip()

        if patient["species"] is None:

            if "canine" in lower:
                patient["species"] = "Canine"

            elif "feline" in lower:
                patient["species"] = "Feline"

        if patient["gender"] is None:

            if "male" in lower:
                patient["gender"] = "Male"

            elif "female" in lower:
                patient["gender"] = "Female"

        if patient["weight"] is None:

            match = re.search(
                r"(\d+(\.\d+)?)\s*(lb|lbs|kg)",
                lower,
            )

            if match:
                patient["weight"] = match.group()

    return patient

def find_item_section(rows):
    """
    Finds where the invoice items begin and end.
    """

    start = 0
    end = len(rows)

    start_keywords = (
        "description",
        "descr",   # survives "Descrlpllon"-style garbling
        "item",
        "service",
        "product",
        "qty",
        "quant",   # survives "Quantlty"-style garbling
    )

    end_keywords = (
        "subtotal",
        "tax",
        "total",
        "balance",
        "payment",
        "amount due",
    )

    for i, line in enumerate(rows):

        lower = line.lower()

        if start == 0:
            if any(keyword in lower for keyword in start_keywords):
                start = i + 1
                continue

        if start > 0:
            if any(keyword in lower for keyword in end_keywords):
                end = i
                break

    return start, end


def extract_items(rows):
    """
    Extracts every invoice item.
    """

    start, end = find_item_section(rows)

    items = []

    for row in rows[start:end]:

        item = parse_item(row)

        if item:
            items.append(item)

    return items


_MONTH_ABBR_DATE_PATTERN = re.compile(
    r"\b(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\.?\s+\d{1,2}\s+\d{2,4}\b",
    re.IGNORECASE,
)


def strip_leading_item_code(row):
    """
    Drops a leading standalone item-code token (e.g. "01118 HEPARIN...")
    so quantity extraction doesn't mistake the code for the Qty column.
    """
    return re.sub(r"^\s*\d{3,6}\s+", "", row)


def strip_date_tokens(row):
    """
    Drops "MON DD YY" style dates (e.g. "MAR 24 23"), which otherwise
    sit between the item code and the real Qty column on some receipt
    layouts and get mistaken for the quantity.
    """
    return _MONTH_ABBR_DATE_PATTERN.sub("", row)


def parse_item(row):
    """
    Parses a single invoice line.
    """

    amount = extract_money(row)

    if amount is None:
        return None

    row_cleaned = strip_date_tokens(strip_leading_item_code(row))

    description = re.sub(
        r"\d[\d.,]*",
        "",
        row_cleaned,
    )

    description = normalize_text(description)

    quantity = 1

    match = re.search(r"\b(\d+)\b", row_cleaned)

    if match:
        quantity = int(match.group())

    return {
        "description": description,
        "quantity": quantity,
        "price": amount,
    }


def cleanup(text):
    """
    Strips a dosage unit (e.g. "mg") and everything after it from an item
    description, for display purposes. By the time this runs, parse_item
    has usually already stripped the dosage number itself, so this must
    match a bare unit too, not just "digit+mg". Also drops a stray
    trailing "$" left over from a merged price column.
    """
    text = re.split(
        r"\s*\d*\s*(?:mg|ml|mcg|cc)\b",
        str(text),
        maxsplit=1,
        flags=re.IGNORECASE,
    )[0]

    text = re.sub(r"[\s$,]+$", "", text)

    return text.strip()


def classify_items(items):
    """
    Categorizes invoice items.
    """

    classified = {
        "vaccines": [],
        "medications": [],
        "services": [],
        "other": [],
    }

    service_keywords = (
        "exam",
        "consult",
        "consultation",
        "office visit",
        "surgery",
        "blood",
        "test",
        "xray",
        "radiograph",
        "ultrasound",
        "groom",
        "boarding",
        "nail",
        "wellness",
    )

    for item in items:

        # Classify on the raw text BEFORE cleanup -- cleanup can strip the
        # very "mg"/"ml" signal is_medication relies on, so classifying
        # after cleaning would blind that check.
        raw_description = item["description"]

        if is_vaccine(raw_description):
            item["description"] = cleanup(raw_description)
            classified["vaccines"].append(item)

        elif is_medication(raw_description):
            item["description"] = cleanup(raw_description)
            classified["medications"].append(item)

        elif any(
            keyword in raw_description.lower()
            for keyword in service_keywords
        ):
            item["description"] = cleanup(raw_description)
            classified["services"].append(item)

        else:
            item["description"] = cleanup(raw_description)
            classified["other"].append(item)

    return classified


def is_vaccine(description):

    description = description.lower()

    return any(
        keyword.lower() in description
        for keyword in config.REGISTERED_VACCINES
    )

_DVM_STOPWORDS = {
    "services", "by", "staff", "name", "dr", "doctor",
    "exam", "examination", "your", "was",
}


def extract_doctor_near_dvm(line):
    """
    Finds "DVM" in a line and grabs up to two real name-words on each
    side, skipping filler/label words (e.g. "Services by ___, DVM",
    "Staff Name ___, DVM ___"). Handles a name before DVM only, a name
    after DVM only, or a name split across both sides.
    """
    match = re.search(r"\bDVM\b", line, re.IGNORECASE)

    if not match:
        return None

    before_words = re.findall(r"[A-Za-z][A-Za-z.'-]*", line[:match.start()])
    after_words = re.findall(r"[A-Za-z][A-Za-z.'-]*", line[match.end():])

    before_words = [w for w in before_words if w.lower() not in _DVM_STOPWORDS][-2:]
    after_words = [w for w in after_words if w.lower() not in _DVM_STOPWORDS][:2]

    name_parts = before_words + ["DVM"] + after_words

    return " ".join(name_parts) if len(name_parts) > 1 else None


def extract_invoice(rows):
    """
    Extract invoice metadata from OCR rows.
    """

    invoice = {
        "invoice_number": None,
        "receipt_number": None,
        "date": None,
        "time": None,
        "doctor": None,
        "license": None,
        "reference": None,
        "status": None,
    }

    date_pattern = r"\d{1,2}[/-]\d{1,2}[/-]\d{2,4}"
    time_pattern = r"\d{1,2}:\d{2}(?::\d{2})?"

    for row in rows:

        line = normalize_text(row)
        lower = line.lower()

        # -----------------------------
        # Date
        # -----------------------------
        if invoice["date"] is None:

            match = re.search(date_pattern, line)

            if match:
                invoice["date"] = match.group()

        # -----------------------------
        # Time
        # -----------------------------
        if invoice["time"] is None:

            match = re.search(time_pattern, line)

            if match:
                invoice["time"] = match.group()

        # -----------------------------
        # Invoice Number
        # -----------------------------
        if (
            invoice["invoice_number"] is None
            and "invoice" in lower
        ):

            parts = re.split(r":|\s+", line)

            for part in reversed(parts):

                part = part.strip()

                if part and part.lower() != "invoice":
                    invoice["invoice_number"] = part
                    break

        # -----------------------------
        # Receipt Number
        # -----------------------------
        if (
            invoice["receipt_number"] is None
            and "receipt" in lower
        ):

            parts = re.split(r":|\s+", line)

            for part in reversed(parts):

                part = part.strip()

                if part and part.lower() != "receipt":
                    invoice["receipt_number"] = part
                    break

        # -----------------------------
        # Doctor
        # -----------------------------
        if invoice["doctor"] is None and "dvm" in lower:
            doctor = extract_doctor_near_dvm(line)

            if doctor:
                invoice["doctor"] = doctor

        elif invoice["doctor"] is None and lower.startswith("dr"):
            invoice["doctor"] = line

        # -----------------------------
        # Veterinary License
        # -----------------------------
        if (
            invoice["license"] is None
            and "license" in lower
        ):

            if ":" in line:
                invoice["license"] = line.split(":", 1)[1].strip()

        # -----------------------------
        # Reference Number
        # -----------------------------
        if (
            invoice["reference"] is None
            and lower.startswith("ref")
        ):

            if ":" in line:
                invoice["reference"] = line.split(":", 1)[1].strip()

        # -----------------------------
        # Payment Status
        # -----------------------------
        if (
            invoice["status"] is None
            and lower.startswith("status")
        ):

            if ":" in line:
                invoice["status"] = line.split(":", 1)[1].strip()

    return invoice
def is_medication(description):

    description = description.lower()

    if any(
        re.search(rf"\b{re.escape(keyword.lower())}\b", description)
        for keyword in config.REGISTERED_MEDICATIONS
    ):
        return True

    medication_forms = (
        "tablet",
        "capsule",
        "caplet",
        "ointment",
        "cream",
        "solution",
        "drops",
        "inject",
        "injection",
        "mg",
        "ml",
    )

    # Word-boundary matching, not bare substring -- otherwise short
    # tokens like "mg" can false-match inside merged OCR text (e.g.
    # "DVMGruntmeir" contains "mg" with no real word boundary).
    return any(
        re.search(rf"\b{re.escape(word)}\b", description)
        for word in medication_forms
    )


def extract_totals(rows):
    """
    Extract receipt totals using config.TOTAL_LABELS, so distinct total
    types (subtotal/tax/total/balance_due/...) are matched by their own
    specific phrases instead of a generic "total"/"balance" substring
    check that let unrelated lines (e.g. "TOTAL NOW DUE") stomp on
    "total" just because both contain the word "total".
    """

    totals = {field: None for field in config.TOTAL_LABELS}

    for row in rows:

        lower = row.lower()

        amount = extract_money(row)

        if amount is None:
            continue

        # Pick the longest matching label across ALL fields, not the
        # first field checked in dict order -- otherwise a generic
        # label like "total" (a substring of "total now due") steals
        # the match before balance_due's more specific label is ever
        # considered.
        best_field, best_length = None, 0

        for field, labels in config.TOTAL_LABELS.items():
            for label in labels:
                if label in lower and len(label) > best_length:
                    best_field, best_length = field, len(label)

        if best_field:
            totals[best_field] = amount

    return totals


def extract_payment(rows):
    """
    Extract payment information.
    """

    payment = {
        "method": None,
        "amount": None,
        "card_last4": None,
        "reference": None,
        "status": None,
    }

    payment_method_keywords = (
        "visa", "mastercard", "amex", "discover", "credit", "debit", "cash",
    )

    for row in rows:

        lower = row.lower()

        if "visa" in lower:
            payment["method"] = "Visa"

        elif "mastercard" in lower:
            payment["method"] = "Mastercard"

        elif "amex" in lower:
            payment["method"] = "American Express"

        elif "discover" in lower:
            payment["method"] = "Discover"

        elif "debit" in lower:
            payment["method"] = "Debit Card"

        elif "credit" in lower:
            payment["method"] = "Credit Card"

        elif "cash" in lower:
            payment["method"] = "Cash"

        # A line naming the method directly (e.g. "VISA: -458.65") often
        # never says "payment"/"paid"/"card" at all, so trigger on the
        # method keywords too, not just those three words.
        if (
            "payment" in lower
            or "paid" in lower
            or "card" in lower
            or any(keyword in lower for keyword in payment_method_keywords)
        ):

            amount = extract_money(row)

            if amount is not None:
                payment["amount"] = amount

        match = re.search(r"\b(\d{4})\b", row)

        if (
            match
            and "card" in lower
        ):
            payment["card_last4"] = match.group(1)

        if lower.startswith("ref"):

            payment["reference"] = row.split(":", 1)[-1].strip()

        if lower.startswith("status"):

            payment["status"] = row.split(":", 1)[-1].strip()

    return payment


def extract_money(line):
    """
    Returns the last monetary value in a line. This OCR engine's most
    common Total-column error is dropping the decimal point as a bare
    space -- "47.96" comes back as two separate tokens, "47" and "96".
    If the last two numeric tokens both look like plain whole-number
    fragments (no decimal point already) and the last is 1-2 digits
    (cents-shaped), reassemble them into one number before parsing.
    """

    matches = re.findall(
        r"\d[\d,]*\.?\d*",
        line,
    )

    if not matches:
        return None

    last = matches[-1]

    if "." not in last and len(matches) >= 2:
        previous = matches[-2]

        if (
            "." not in previous
            and previous.isdigit()
            and last.isdigit()
            and len(last) <= 2
        ):
            return clean_number(f"{previous}.{last}")

    return clean_number(last)


def build_dictionary(header, patient, invoice, items, totals, payment, debug_rows=None):
    """
    Builds the final receipt dictionary.
    """

    result = {
        "hospital": header.get("hospital"),
        "invoice_number": invoice.get("invoice_number") or header.get("invoice_number"),
        "date": invoice.get("date") or header.get("date"),
        "doctor": invoice.get("doctor"),
        "owner": patient.get("owner"),
        "patient": patient.get("patient"),
        "species": patient.get("species"),
        "breed": patient.get("breed"),
        "gender": patient.get("gender"),
        "weight": patient.get("weight"),
        "vaccines": items.get("vaccines", []),
        "medications": items.get("medications", []),
        "services": items.get("services", []),
        "other_items": items.get("other", []),
        "subtotal": totals.get("subtotal"),
        "tax": totals.get("tax"),
        "discount": totals.get("discount"),
        "total": totals.get("total"),
        "balance_due": totals.get("balance_due"),
        "payment": payment,
    }

    # TEMPORARY -- remove once the price/subtotal misread is diagnosed.
    if debug_rows is not None:
        result["_debug_rows"] = debug_rows

    return result
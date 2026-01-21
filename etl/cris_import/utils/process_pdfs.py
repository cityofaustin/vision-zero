from datetime import datetime, timezone
from concurrent.futures import ProcessPoolExecutor
import os
from pathlib import Path

import time

from pdf2image import convert_from_path, pdfinfo_from_path, pdfinfo_from_bytes
from pytesseract import image_to_data, Output

from utils.graphql import UPDATE_CRASH_CR3_FIELDS, make_hasura_request
from utils.logging import get_logger
from utils.files import upload_file_to_s3
from utils.settings import (
    DIAGRAM_BBOX_PIXELS,
    CR3_FORM_V2_TEST_PIXELS,
    CR4_FORM_TEST_PIXELS,
    CR4_FORM_V2_TEST_PIXELS,
    CR4_DIAGRAM_Y_FALLBACK,
    CR4_DIAGRAM_Y_MIN,
    CR4_DIAGRAM_Y_MAX,
)

ENV = os.getenv("BUCKET_ENV")
logger = get_logger()


def are_all_pixels_black(page, test_pixels, threshold=5):
    """Check if all specified pixels are black (RGB values below threshold).

    Args:
        page (PIL image): the PDF page as an image
        test_pixels (list[tuple]): list of (x, y) pixel coordinates to check
        threshold (int): maximum RGB value to consider as black (default: 5)

    Returns:
        bool: True if all pixels are black, False otherwise
    """
    page_width, page_height = page.size
    for pixel in test_pixels:
        try:
            rgb_pixel = page.getpixel(pixel)
            if (
                rgb_pixel[0] > threshold
                or rgb_pixel[1] > threshold
                or rgb_pixel[2] > threshold
            ):
                return False
        except IndexError:
            # Pixel coordinates out of bounds - this indicates test pixel coordinates
            # may be misconfigured for this page size
            logger.debug(
                f"Test pixel {pixel} is out of bounds for page size {page_width}x{page_height}. "
                "This may indicate misconfigured test pixel coordinates."
            )
            return False
    return True


def find_diagram_top_y_ocr(page):
    """Find the Y coordinate where the crash diagram starts using OCR.
    
    Searches for the "Crash Diagram" header text and returns the bottom Y coordinate
    of that text box, which marks the top of the diagram area.
    
    Args:
        page (PIL image): the PDF page as an image
    
    Returns:
        int or None: Y coordinate of diagram top, or None if not found
    """
    try:
        # Get OCR data with word-level bounding boxes
        ocr_data = image_to_data(page, lang="eng", output_type=Output.DICT)
        
        # Extract valid words with their bounding box info
        # Filter by confidence > 30 to avoid OCR noise
        words = [
            {
                'text': word.strip().upper(),
                'top': ocr_data['top'][i],
                'bottom': ocr_data['top'][i] + ocr_data['height'][i],
            }
            for i, word in enumerate(ocr_data['text'])
            if word.strip() and (int(ocr_data['conf'][i]) if ocr_data['conf'][i] != '-1' else 0) > 30
        ]
        
        # Find "Crash" followed by "Diagram" on the same line
        for i, word1 in enumerate(words):
            if word1['text'] in ['CRASH', 'CRASHES']:
                # Check next 10 words for "Diagram" on the same line
                for word2 in words[i+1:i+11]:
                    if word2['text'] in ['DIAGRAM', 'DIAGRAMS']:
                        if abs(word1['top'] - word2['top']) < 20:  # Same line (within 20px)
                            # Return bottom of the lower word + small padding
                            result = max(word1['bottom'], word2['bottom']) + 5
                            logger.debug(f"Found 'Crash Diagram' at Y={result}")
                            return result
        
        logger.debug("OCR did not find 'Crash Diagram' text")
        return None
            
    except Exception as e:
        logger.warning(f"OCR failed while finding diagram top: {e}")
        return None


def get_cr4_diagram_bbox(page, form_version):
    """Dynamically calculate the CR4 diagram bounding box.
    
    The diagram position varies based on how much text is in fields above it.
    We dynamically find where the diagram starts (top Y) using OCR to locate
    the "Crash Diagram" header text, and use fixed values for left, right,
    and bottom based on the form layout.
    
    Args:
        page (PIL image): the PDF page as an image (page 1 for CR4)
        form_version (str): the detected form version (e.g., 'cr4_v1_small')
    
    Returns:
        tuple: (x1, y1, x2, y2) bounding box coordinates
    """
    width, height = page.size
    
    # Get fixed coordinates from settings (x1, x2, y2 are consistent across all CR4 forms)
    # Extract from the fallback bbox for this form version, or use a default CR4 entry
    default_bbox = DIAGRAM_BBOX_PIXELS.get(form_version)
    x1, _, x2, y2 = default_bbox  # Extract x1, x2, y2 (ignore y1, we'll detect it dynamically)
    
    # Dynamically find the top Y coordinate using OCR
    y1 = find_diagram_top_y_ocr(page)
    
    # Fallback: use version-specific default from settings if OCR fails
    if y1 is None:
        logger.info(f"OCR failed to find diagram, using fallback coordinates for {form_version}")
        if default_bbox:
            logger.debug(f"Using fallback bbox from settings: {default_bbox}")
            return default_bbox
        else:
            # Ultimate fallback: use a safe default
            logger.warning(f"No fallback found in settings for {form_version}, using hardcoded default")
            logger.warning(f"Available keys in DIAGRAM_BBOX_PIXELS: {list(DIAGRAM_BBOX_PIXELS.keys())}")
            y1 = CR4_DIAGRAM_Y_FALLBACK
            logger.warning(f"Using hardcoded Y coordinate: {y1}")
    
    # Ensure Y coordinate is within reasonable bounds
    y1 = max(CR4_DIAGRAM_Y_MIN, min(y1, CR4_DIAGRAM_Y_MAX))
    
    bbox = (x1, y1, x2, y2)
    logger.debug(f"Dynamic CR4 diagram bbox: {bbox}")
    return bbox


def get_crash_report_version(page):
    """Determine the crash report form version (CR3 or CR4).

    The check is conducted by sampling if various pixels are black.
    Different form versions have different layouts, so we check for
    pixels that are unique to each form type.

    Crash Report Form history:
    - CR3 v1: Legacy form (pre-August 2024)
    - CR3 v2: Updated form (August 2024+)
    - CR4 v1: New form introduced with CRIS v30 (December 2025+)
      - Has "Intersecting Road" section
    - CR4 v2: New form introduced with CRIS v30 (December 2025+)
      - Has "Nearest Intersecting Road or Reference Marker" section

    On August 27, 2024 CRIS started delivering all CR3s using a
    smaller page size. This function handles both the legacy large
    format page and the new smaller page size.

    Args:
        page (PIL image): the PDF page as an image

    Returns:
        str: Form version identifier:
            - 'v1_small', 'v1_large': CR3 v1 forms
            - 'v2_large', 'v2_small': CR3 v2 forms
            - 'cr4_v1_small': CR4 v1 forms (has "Intersecting Road")
            - 'cr4_v2_small': CR4 v2 forms (has "Reference Marker" in section header)
    """
    width, height = page.size
    page_size = "small" if width < 2000 else "large"

    # Check for CR4 form first (any version)
    if page_size == "small" and are_all_pixels_black(page, CR4_FORM_TEST_PIXELS["small"]):
        # Distinguish between CR4 v1 and CR4 v2 using pixel-based detection
        # CR4 v2 has "Nearest Intersecting Road or Reference Marker" section (longer text)
        # CR4 v1 has "Intersecting Road" section (shorter text)
        # The longer text in v2 creates different black pixel patterns
        if are_all_pixels_black(page, CR4_FORM_V2_TEST_PIXELS["small"]):
            return "cr4_v2_small"
        else:
            return "cr4_v1_small"

    # Check for CR3 v2 form
    if are_all_pixels_black(page, CR3_FORM_V2_TEST_PIXELS[page_size]):
        return f"v2_{page_size}"

    # Default to CR3 v1
    return f"v1_{page_size}"


def crop_and_save_diagram(page, cris_crash_id, bbox, extract_dir):
    """Crop out the crash diagram and save it to the local directory.

    The diagram is saved to <extract_dir>/crash_diagrams/<cris_crash_id>.jpeg

    Args:
        page (PIL image): the CR3 pdf page as an image
        cris_crash_id (int): the CRIS crash ID
        bbox (tuple[int]): the bounding box pixels to crop
        extract_dir (str): the local directory in which to save the file

    Returns:
        str: diagram_full_path - the full path to the saved diagram, including it's name
        str: diagram_filename - the name of diagram file, .e.g 12345678.jpeg
    """
    diagram_image = page.crop(bbox)
    diagram_filename = f"{cris_crash_id}.jpeg"
    diagram_full_path = os.path.join(extract_dir, "crash_diagrams", diagram_filename)
    diagram_image.save(diagram_full_path)
    return diagram_full_path, diagram_filename


def get_crash_report_pdf_object_key(filename, kind):
    """Format the S3 object to which the crash report PDF or diagram saved"""
    return f"{ENV}/cr3s/{kind}/{filename}"


def process_pdf(extract_dir, filename, s3_upload, index):
    """Handles processing of one crash report PDF document (CR3 or CR4).

    Extracts the crash diagram from the PDF and saves it locally.
    - CR3 forms: diagram is on page 2
    - CR4 forms: diagram is on page 1

    Optionally uploads both the PDF and diagram to S3.

    Args:
        extract_dir (str): the local path to the current extract
        filename (str): the filename of the PDF to process, e.g. 123456.pdf
        s3_upload (bool): if the diagram and PDF should be uploaded to the S3 bucket
        index (int): the index ID of this pdf among all PDFs being processed
    """
    logger.info(f"Processing {filename} ({index})")
    cris_crash_id = int(filename.replace(".pdf", ""))
    
    pdf_path = os.path.join(extract_dir, "crashReports", filename)

    logger.debug("Converting PDF page 1 to check for CR4...")

    # First, check page 1 to see if this is a CR4 form
    page1 = convert_from_path(
        pdf_path,
        fmt="jpeg", # jpeg is much faster than the default ppm fmt
        first_page=1, # page 1 has the crash diagram for CR4 forms
        last_page=1,
        dpi=150,
    )[0]

    form_version = get_crash_report_version(page1)
    logger.debug(f"Detected form version: {form_version}")

    # CR4 forms have the diagram on page 1, CR3 forms have it on page 2
    if form_version.startswith("cr4"):
        page = page1
        # Use dynamic bbox calculation for CR4 forms
        bbox = get_cr4_diagram_bbox(page, form_version)
    else:
        logger.debug("CR3 detected, converting page 2 for diagram...")
        page = convert_from_path(
            pdf_path,
            fmt="jpeg",
            first_page=2,
            last_page=2,
            dpi=150,
        )[0]
        # Use fixed bbox for CR3 forms
        bbox = DIAGRAM_BBOX_PIXELS[form_version]

    logger.debug("Cropping crash diagram...")

    diagram_full_path, diagram_filename = crop_and_save_diagram(
        page, cris_crash_id, bbox, extract_dir
    )

    if s3_upload:
        s3_object_key_pdf = get_crash_report_pdf_object_key(filename, "pdfs")
        logger.debug(f"Uploading CR3 pdf to {s3_object_key_pdf}")
        upload_file_to_s3(pdf_path, s3_object_key_pdf, content_type='application/pdf')

        s3_object_key_diagram = get_crash_report_pdf_object_key(diagram_filename, "crash_diagrams")
        logger.debug(f"Uploading crash diagram to {s3_object_key_diagram}")
        upload_file_to_s3(diagram_full_path, s3_object_key_diagram, content_type='image/jpeg')

        logger.debug(f"Updating crash CR3 metadata")
        res = make_hasura_request(
            query=UPDATE_CRASH_CR3_FIELDS,
            variables={
                "cris_crash_id": cris_crash_id,
                "data": {
                    "cr3_processed_at": datetime.now(timezone.utc).isoformat(),
                    "cr3_stored_fl": True,
                },
            },
        )
        # check to make sure that we actually updated a crash record
        affected_rows = res["update_crashes_cris"]["affected_rows"]
        if not affected_rows:
            raise ValueError(
                f"Crash ID: {cris_crash_id} - CR3 PDF has no matching crash record in the DB. This should never happen."
            )


def process_pdfs(extract_dir, s3_upload, max_workers):
    """Main loop for extracting crash diagrams from crash report PDFs (CR3 and CR4).

    Processes all PDF files in the extract's crashReports directory, extracting
    crash diagrams and optionally uploading to S3.

    Args:
        extract_dir (str): the local path to the current extract
        s3_upload (bool): if the diagram and PDF should be uploaded to the S3 bucket
        max_workers (int): the maximum number of workers to assign to the
            multiprocessing pool
    """
    overall_start_tme = time.time()
    # make the crash_diagram extract directory
    Path(os.path.join(extract_dir, "crash_diagrams")).mkdir(parents=True, exist_ok=True)

    pdfs = [
        filename
        for filename in os.listdir(os.path.join(extract_dir, "crashReports"))
        if filename.endswith(".pdf")
    ]

    pdf_count = len(pdfs)

    logger.info(f"Found {pdf_count} PDFs to process")

    futures = []
    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        for index, filename in enumerate(pdfs):
            future = executor.submit(
                process_pdf, extract_dir, filename, s3_upload, index
            )
            futures.append(future)
    # inspect results and collect all errors—this must be done after all pdfs have
    # processed because future.result() is blocking
    errors = []
    for index, future in enumerate(futures):
        try:
            future.result()
        except Exception as e:
            # grab the filename from the pdf list
            filename = pdfs[index]
            errors.append([filename, e])

    if errors:
        logger.error(
            f"Encountered {len(errors)} error(s) processing PDFs. Logging up to 10 errors and raising the first..."
        )
        for filename, e in errors[0:10]:
            logger.info(f"Error processing {filename}: {e}")
        raise errors[0][1]

    logger.info(
        f"✅ {pdf_count} Crash Report PDFs processed in {round((time.time() - overall_start_tme)/60, 2)} minutes"
    )
    return pdf_count

import os
import time

from pdf2image import convert_from_path

from utils.logging import get_logger
from utils.utils import (
    archive_extract_zip,
)
from utils.settings import DIAGRAM_BBOX_PIXELS, NEW_CR3_FORM_TEST_PIXELS

logger = get_logger()


def is_new_cr3_form(page):
    """Slightly modifiy these from the old version"""
    new_cr3_form = True
    for pixel in NEW_CR3_FORM_TEST_PIXELS:
        rgb_pixel = page.getpixel(pixel)
        if rgb_pixel[0] != 0 or rgb_pixel[1] != 0 or rgb_pixel[2] != 0:
            new_cr3_form = False
            break
    return new_cr3_form


def crop_and_save_diagram(page, crash_id, is_new_cr3_form, extract_dir):
    bbox = DIAGRAM_BBOX_PIXELS["new"] if is_new_cr3_form else DIAGRAM_BBOX_PIXELS["old"]
    diagram_image = page.crop(bbox)
    # todo: is it ok to swith to JPEG (as is done here) and save 75% disk space?
    diagram_image.save(
        os.path.join(
            extract_dir, f"{crash_id}{'' if is_new_cr3_form else '_old_form'}.jpeg"
        )
    )


def process_pdfs(extract_dir):
    overall_start_tme = time.time()
    pdfs = [
        filename
        for filename in os.listdir(os.path.join(extract_dir, "crashReports"))
        if filename.endswith(".pdf")
    ]
    pdf_count = len(pdfs)

    for i, filename in enumerate(pdfs):
        logger.info(f"Processing {filename} ({i+1}/{pdf_count})")
        crash_id = int(filename.replace(".pdf", ""))
        path = os.path.join(extract_dir, "crashReports", filename)
        logger.debug("Converting PDF to image...")
        page = convert_from_path(
            path,
            # output_folder="stuff",
            # output_file=f"{crash_id}.jpeg",
            # jpeg is much faster than the default ppm fmt
            fmt="jpeg",
            first_page=2,
            last_page=2,
            dpi=150,
        )[0]
        logger.debug("Cropping crash diagram...")
        crop_and_save_diagram(page, crash_id, is_new_cr3_form(page), extract_dir)

    logger.info(
        f"✅ {pdf_count} CR3s processed in {round((time.time() - overall_start_tme)/60, 2)} minutes"
    )

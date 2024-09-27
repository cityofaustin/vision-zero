from datetime import datetime, timezone
from concurrent.futures import ProcessPoolExecutor

from pdf2image import convert_from_bytes
from pytesseract import image_to_string, image_to_data

from utils.cli import get_cli_args
from utils.files import download_cr3_pdf
from utils.graphql import (
    make_hasura_request,
    NARRATIVES_TODO_QUERY,
    UPDATE_CRASH_NARRATIVE_OCR_MUTATION,
)
from utils.logging import init_logger
from utils.process_pdfs import get_cr3_version
from utils.settings import NARRATIVE_BBOX_PIXELS


def extract_narrative_pdf(cris_crash_id, crash_pk, index):
    """Handles narrative extraction of one PDF"""
    logger.info(f"Processing cris crash ID {cris_crash_id} ({index})")
    pdf = download_cr3_pdf(cris_crash_id)

    logger.debug("Converting PDF to image...")
    page = convert_from_bytes(
        pdf,
        fmt="jpeg",  # jpeg is much faster than the default ppm fmt
        first_page=2,  # page 2 has the crash narrative
        last_page=2,
        dpi=150,
    )[0]

    cr3_version = get_cr3_version(page)
    logger.debug(f"CR3 version: {cr3_version}")

    page.save(f"temp/{cris_crash_id}_page_{cr3_version}.jpeg")

    bbox = NARRATIVE_BBOX_PIXELS[cr3_version]

    logger.debug("Cropping narrative from PDF...")
    narrative_image = page.crop(bbox)
    narrative_image.save(f"temp/{cris_crash_id}_narrative_{cr3_version}.jpeg")

    logger.debug("Extracting narrative text...")
    narrative = None
    narrative = image_to_string(narrative_image, lang="eng")

    logger.debug(f"Extracted narrative: {narrative}")

    variables = {
        "id": crash_pk,
        "updates": {
            "investigator_narrative": narrative,
            "investigator_narrative_ocr_processed_at": datetime.now(
                timezone.utc
            ).isoformat(),
            "updated_by": "dts_automation",
        },
    }

    logger.debug("Updating crash record...")
    make_hasura_request(
        query=UPDATE_CRASH_NARRATIVE_OCR_MUTATION, variables=variables
    )

def main():
    logger.info("Downloading crashes todo...")
    todos = make_hasura_request(query=NARRATIVES_TODO_QUERY)[
        "view_crash_narratives_ocr_todo"
    ]

    logger.info(f"{len(todos)} to process")
    if not todos:
        return

    futures = []
    with ProcessPoolExecutor(max_workers=cli_args.workers) as executor:
        for index, crash in enumerate(todos):
            future = executor.submit(
                extract_narrative_pdf, crash["cris_crash_id"], crash["id"], index
            )
            futures.append(future)
    errors = []
    for index, future in enumerate(futures):
        try:
            future.result()
        except Exception as e:
            # grab the filename from the pdf list
            crash = todos[index]
            errors.append([crash["cris_crash_id"], e])

    if errors:
        logger.error(
            f"Encountered {len(errors)} error(s) extracting narratives. Logging up to 10 errors and raising the first..."
        )
        for cris_crash_id, e in errors[0:10]:
            logger.info(f"Error processing CRIS crash ID {cris_crash_id}: {e}")
        raise errors[0][1]

if __name__ == "__main__":
    cli_args = get_cli_args()
    logger = init_logger(debug=cli_args.verbose)
    main()

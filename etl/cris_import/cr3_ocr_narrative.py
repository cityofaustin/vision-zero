from datetime import datetime, timezone

from pdf2image import convert_from_bytes
from pytesseract import image_to_string

from utils.cli import get_cli_args
from utils.files import download_cr3_pdf
from utils.graphql import (
    make_hasura_request,
    NARRATIVES_TODO_QUERY,
    UPDATE_CRASH_NARRATIVE_OCR_MUTATION,
)
from utils.logging import init_logger
from utils.process_pdfs import get_pdf_width_from_bytes, get_cr3_version
from utils.settings import NARRATIVE_BBOX_PIXELS


def main(cli_args):
    raise Exception("Remember you need to first run the check to restore nullified narratives")
    # get crashes where narrative is null, pdf is not null, narrative_ocr_date is null
    # investigator_narrative_ocr
    todos = make_hasura_request(query=NARRATIVES_TODO_QUERY)["crashes"]
    for crash in todos:
        cris_crash_id = crash["cris_crash_id"]
        pdf = download_cr3_pdf(cris_crash_id)

        logger.info("Converting PDF to image...")
        page = convert_from_bytes(
            pdf,
            fmt="jpeg",  # jpeg is much faster than the default ppm fmt
            first_page=2,  # page 2 has the crash narrative
            last_page=2,
            dpi=150,
        )[0]

        logger.info("Cropping narrative from PDF...")
        page_width = get_pdf_width_from_bytes(pdf)
        cr3_version = get_cr3_version(page, page_width)
        bbox = NARRATIVE_BBOX_PIXELS[cr3_version]

        if not bbox:
            continue

        print(cr3_version)
        narrative_image = page.crop(bbox)
        narrative_image.save("narrative_crop.jpeg")

        logger.info("Extracting narrative text...")
        narrative = None
        narrative = image_to_string(narrative_image)

        breakpoint()
        variables = {
            "id": crash["id"],
            "updates": {
                "investigator_narrative": narrative,
                "investigator_narrative_ocr_processed_at": datetime.now(
                    timezone.utc
                ).isoformat(),
                "updated_by": "dts_automation",
            },
        }

        # make_hasura_request(
        #     query=UPDATE_CRASH_NARRATIVE_OCR_MUTATION, variables=variables
        # )



if __name__ == "__main__":
    cli_args = get_cli_args()
    logger = init_logger(debug=cli_args.verbose)
    main(cli_args)

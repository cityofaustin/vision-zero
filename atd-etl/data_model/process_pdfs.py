# docker run -it --rm -v $PWD:/app data-model-dev /bin/bash
# TODO:
# - configure local file storage
# - integrate hasura
# - add columns to include diagram UUID, cr3 processed date, cr3 stored boolean, diagram url
# - do we need to deal with "digital_end_to_end" - or just always try to snip a diagram?#
#

import os
from tempfile import TemporaryDirectory

import boto3
from pdf2image import convert_from_path

from utils.utils import (
    get_extracts_todo,
    download_and_unzip_extract,
    move_zip_to_next_stage,
)

from utils.settings import DIAGRAM_BBOX_PIXELS, NEW_CR3_FORM_TEST_PIXELS


def get_file_metadata(path):
    file_size = os.path.getsize(path)
    return {
        "file_size": file_size,
    }


def is_new_cr3_form(page):
    """Slightly modifiy these from the old version"""
    new_cr3_form = True
    for pixel in NEW_CR3_FORM_TEST_PIXELS:
        rgb_pixel = page.getpixel(pixel)
        if rgb_pixel[0] != 0 or rgb_pixel[1] != 0 or rgb_pixel[2] != 0:
            new_cr3_form = False
            break
    return new_cr3_form


def crop_diagram(page, crash_id, is_new_cr3_form):
    bbox = DIAGRAM_BBOX_PIXELS["new"] if is_new_cr3_form else DIAGRAM_BBOX_PIXELS["old"]
    diagram_image = page.crop(bbox)
    # todo: is it ok to swith to JPEG (as is done here) and save 75% disk space?
    diagram_image.save(f"stuff/{crash_id}{'' if is_new_cr3_form else '_old_form'}.jpeg")


def main():
    current_stage = "pdfs_todo"
    s3_client = boto3.client("s3")
    s3_resource = boto3.resource("s3")
    extracts = get_extracts_todo(s3_client, current_stage)

    print(f"{len(extracts)} extracts to process")

    if not extracts:
        return

    for extract in extracts:
        """
        hmmm how to design for processing lots of PDFs.
        --use-local-disk: download only if there are no unzipped extracts? and, regardless, use local directory
        """
        with TemporaryDirectory() as temp_dir_name:
            download_and_unzip_extract(s3_client, temp_dir_name, **extract)
            # this could be a very large number of files—we should swithc to os.walk instead
            pdfs = [
                filename
                for filename in os.listdir(os.path.join(temp_dir_name, "crashReports"))
                if filename.endswith(".pdf")
            ]
            print(f"Found {len(pdfs)} crash report PDfs to process")

            for filename in pdfs:
                print(f"Processing {filename}")
                crash_id = int(filename.replace(".pdf", ""))
                path = os.path.join(temp_dir_name, "crashReports", filename)
                file_metadata = get_file_metadata(path)
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
                crop_diagram(page, crash_id, is_new_cr3_form(page))
                # breakpoint()

            breakpoint()
            # move_zip_to_next_stage(
            #     s3_client, s3_resource, extract["file_key"], current_stage
            # )


if __name__ == "__main__":
    main()

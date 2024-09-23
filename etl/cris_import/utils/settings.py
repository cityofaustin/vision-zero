LOCAL_EXTRACTS_DIR = "extracts"

"""This is the bbox used to crop the crash diagram"""
DIAGRAM_BBOX_PIXELS = {
    "v1_small": (681, 928, 1315, 1590),
    "v1_large": (2589, 3531, 5001, 6048),
    "v2_small": (658, 791, 1270, 1430),
    "v2_large": (2496, 3036, 4836, 5464),
}

"""If all four of these pixels are black, it is a 'new' CR3 pdf"""
NEW_CR3_FORM_TEST_PIXELS = {
    "small": [
        (115, 670),
        (300, 670),
        (165, 224),
        (545, 224),
    ],
    "large": [
        (215, 2567),
        (872, 2568),
        (625, 1806),
        (4834, 279),
    ],
}

CSV_UPLOAD_BATCH_SIZE = 1000

# max number of CPU cores to utilize when processing PDFs concurrently
MULTIPROCESSING_PDF_MAX_WORKERS = 4
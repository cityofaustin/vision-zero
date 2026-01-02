LOCAL_EXTRACTS_DIR = "extracts"

"""This is the bbox used to crop the crash diagram"""
DIAGRAM_BBOX_PIXELS = {
    "v1_small": (681, 928, 1315, 1590),
    "v1_large": (2589, 3531, 5001, 6048),
    "v2_small": (658, 791, 1270, 1430),
    "v2_large": (2496, 3036, 4836, 5464),
}

"""This is the bbox used to crop the crash narrative"""
NARRATIVE_BBOX_PIXELS = {
    "v1_small": (30, 928, 681, 1590),
    "v1_large": (296, 3683, 2580, 5749),
    "v2_small": (30, 791, 650, 1430),
    "v2_large": (90, 3026, 2496, 5466),
}

"""If all four of these pixels are black, it is a 'new' CR3 pdf"""
CR3_FORM_V2_TEST_PIXELS = {
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

# Schema years known to our ETL/DB. This will need to be incremented periodically
# as CRIS releases new versions
CRIS_MIN_MAX_SCHEMA_YEARS = (2001, 2026)

CSV_UPLOAD_BATCH_SIZE = 1000

# max number of CPU cores to utilize when processing PDFs concurrently
MULTIPROCESSING_PDF_MAX_WORKERS = 4

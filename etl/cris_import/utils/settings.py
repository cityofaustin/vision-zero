LOCAL_EXTRACTS_DIR = "extracts"

"""
Bounding box coordinates (x1, y1, x2, y2) used to crop the crash diagram from PDF pages.

Form versions:
- v1_*: Legacy CR3 form (pre-2024) - diagram on PAGE 2
- v2_*: Updated CR3 form (August 2024+) - diagram on PAGE 2
- cr4_*: New CR4 form (CRIS v30, December 2025+) - diagram on PAGE 1

Size variants:
- *_small: Smaller page format (width < 2000px at 150 DPI)
- *_large: Legacy larger page format (width >= 2000px at 150 DPI)

Note: CR4 forms use the small page format.
"""
DIAGRAM_BBOX_PIXELS = {
    # CR3 form versions
    "v1_small": (681, 928, 1315, 1590),
    "v1_large": (2589, 3531, 5001, 6048),
    "v2_small": (658, 791, 1270, 1430),
    "v2_large": (2496, 3036, 4836, 5464),
    # CR4 form (CRIS v30+)
    "cr4_small": (74, 842, 1201, 1575),
}

"""
Bounding box coordinates (x1, y1, x2, y2) used to crop the crash narrative from PDF pages.

Note: CR4 forms are not included here because CRIS provides the narrative in the CSV data
for CR4 forms, so OCR extraction is not needed.
"""
NARRATIVE_BBOX_PIXELS = {
    # CR3 form versions only
    "v1_small": (30, 928, 681, 1590),
    "v1_large": (296, 3683, 2580, 5749),
    "v2_small": (30, 791, 650, 1430),
    "v2_large": (90, 3026, 2496, 5466),
}

"""
Test pixels to identify CR3 v2 forms.
If all pixels at these coordinates are black (RGB values < 5), the form is CR3 v2.
"""
CR3_FORM_V2_TEST_PIXELS = {
    "small": [
        (100, 150),
        (1000, 148),
        (100, 892),
        (1000, 892),
    ],
    "large": [
        (215, 2567),
        (872, 2568),
        (625, 1806),
        (4834, 279),
    ],
}

"""
Test pixels to identify CR4 forms.
If all pixels at these coordinates are black (RGB values < 5), the form is CR4.

IMPORTANT: These pixels are checked on PAGE 1 of the PDF (where CR4 has its diagram).
The pixels should be black on CR4 page 1 but NOT black on CR3 page 1.
"""
CR4_FORM_TEST_PIXELS = {
    "small": [
        # TODO: These need to be calibrated for PAGE 1 of CR4
        # Use: python analyze_pdf_form.py CR4.pdf --page 1 --save-page --show-grid
        (599, 100),
        (500, 292),
        (1200, 500),
        (1200, 1000),
    ],
}

# Schema years known to our ETL/DB. This will need to be incremented periodically
# as CRIS releases new versions
CRIS_MIN_MAX_SCHEMA_YEARS = (2001, 2026)

CSV_UPLOAD_BATCH_SIZE = 1000

# max number of CPU cores to utilize when processing PDFs concurrently
MULTIPROCESSING_PDF_MAX_WORKERS = 4

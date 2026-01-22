LOCAL_EXTRACTS_DIR = "extracts"

"""
Bounding box coordinates (x1, y1, x2, y2) used to crop the crash diagram from PDF pages.

Form versions:
- v1_*: Legacy CR3 form (pre-2024) - diagram on PAGE 2
- v2_*: Updated CR3 form (August 2024+) - diagram on PAGE 2
- cr4_v1_*: CR4 form v1 (CRIS v30, December 2025+) - diagram on PAGE 1
  - Has "Intersecting Road" section
- cr4_v2_*: CR4 form v2 (CRIS v30, December 2025+) - diagram on PAGE 1
  - Has "Nearest Intersecting Road or Reference Marker" section

Size variants:
- *_small: Smaller page format (width < 2000px at 150 DPI)
- *_large: Legacy larger page format (width >= 2000px at 150 DPI)

IMPORTANT: CR4 forms use DYNAMIC bounding box calculation!
The top Y coordinate (y1) is detected dynamically using OCR to find the "Crash Diagram"
header text, because the diagram position varies based on how much text wraps in fields above it.
The fixed coordinates below are only used as fallbacks if dynamic detection fails.

Fixed coordinates for CR4 (used as fallbacks and for left/right/bottom):
- Left (x1): 74
- Right (x2): 1201  
- Bottom (y2): 1575
- Top (y1): Dynamically detected (typically 750-900 depending on form content)
"""
DIAGRAM_BBOX_PIXELS = {
    # CR3 form versions (fixed coordinates)
    "v1_small": (681, 928, 1315, 1590),
    "v1_large": (2589, 3531, 5001, 6048),
    "v2_small": (658, 791, 1270, 1430),
    "v2_large": (2496, 3036, 4836, 5464),
    # CR4 form versions (fallback coordinates - top Y is detected dynamically)
    # CR4 v1: Has "Intersecting Road" section
    "cr4_v1_small": (74, 802, 1201, 1575),
    # CR4 v2: Has "Nearest Intersecting Road or Reference Marker" section
    "cr4_v2_small": (74, 842, 1201, 1575),  
}

"""
Constants for CR4 dynamic diagram detection fallback and bounds.

These are used when OCR fails to find the "Crash Diagram" header text.
"""
# Hardcoded fallback Y coordinate when OCR fails and no form-specific fallback exists
CR4_DIAGRAM_Y_FALLBACK = 800

# Bounds for clamping the dynamically detected Y coordinate
# The Y coordinate is clamped to ensure it's within reasonable bounds for CR4 forms
CR4_DIAGRAM_Y_MIN = 700
CR4_DIAGRAM_Y_MAX = 1000

"""
Bounding box coordinates (x1, y1, x2, y2) used to crop the crash narrative from PDF pages.

Note: CR4 forms are not included here because CRIS provides the narrative in the CSV data
for CR4 forms, so OCR extraction is not needed (hopefully).
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
        (100, 400),
        (300, 300),
        (1800, 300),
        (3200, 300),
    ],
}

"""
Test pixels to identify CR4 forms (any version).
If all pixels at these coordinates are black (RGB values < 5), the form is CR4.

IMPORTANT: These pixels are checked on PAGE 1 of the PDF (where CR4 has its diagram).
The pixels should be black on CR4 page 1 but NOT black on CR3 page 1.
"""
CR4_FORM_TEST_PIXELS = {
    "small": [
        (599, 100),
        (500, 292),
        (1200, 500),
        (1200, 1000),
    ],
}

"""
Test pixels to distinguish CR4 v2 from CR4 v1.

CR4 v2 has "Nearest Intersecting Road or Reference Marker" section (longer text).
CR4 v1 has "Intersecting Road" section (shorter text).

If all pixels at these coordinates are black (RGB values < 5), the form is CR4 v2.
These pixels should be in the area where the longer text appears in CR4 v2.

IMPORTANT: These pixels are checked on PAGE 1 of the PDF.
The pixels should be black on CR4 v2 but NOT black on CR4 v1.
"""
CR4_FORM_V2_TEST_PIXELS = {
    "small": [
        (409,420),
        (450,601),
        (805,420),
        (550,601),
        (409,420),
    ],
}

# Schema years known to our ETL/DB. This will need to be incremented periodically
# as CRIS releases new versions
CRIS_MIN_MAX_SCHEMA_YEARS = (2001, 2026)

CSV_UPLOAD_BATCH_SIZE = 1000

# max number of CPU cores to utilize when processing PDFs concurrently
MULTIPROCESSING_PDF_MAX_WORKERS = 4

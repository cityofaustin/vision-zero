"""
Hierarchical matching rules for linking EMS PCR records to CRIS people records.

Rules are applied sequentially from most to least restrictive. This ensures
high-confidence matches are made first.

Each rule specifies  which attributes must match (evaluate to True) between the
PCR and person record for the pairing to be accepted. The first rule that finds
a match wins, preventing the same person from being matched to multiple PCRs.

Each rule contains:
  - name: Identifier used for logging match statistics
  - attrs: List of attributes that must ALL match in the comparison results
"""

# fmt: off
MATCH_RULES = [
    {
        "name": "a",
        "attrs": ["sex", "ethnicity", "age", "pos_in_vehicle", "travel_mode", "injury_severity"],
    },
    {
        "name": "b",
        "attrs": ["sex", "ethnicity", "age", "pos_in_vehicle", "travel_mode"],
    },
    {
        "name": "c",
        "attrs": ["sex", "ethnicity", "age", "pos_in_vehicle", "injury_severity"],
    },
    {
        "name": "d",
        "attrs": ["sex", "ethnicity", "age", "pos_in_vehicle",],
    },
    {
        "name": "e",
        "attrs": ["sex", "ethnicity", "age",  "injury_severity"],
    },
    {
        "name": "e1",
        "attrs": ["sex", "ethnicity", "age"],
    },
    {
        "name": "f",
        "attrs": ["sex", "ethnicity", "age_approx",  "pos_in_vehicle"],
    },
    {
        "name": "f2",
        "attrs": ["sex", "age", "transport_dest"],
    },
    {
        "name": "g",
        "attrs": ["sex", "age_approx", "transport_dest"],
    },
    {
        "name": "h",
        "attrs": ["sex", "age_approx"],
    },
    {
        "name": "i",
        "attrs": ["sex", "transport_dest"],
    },
    {
        "name": "j",
        "attrs": ["transport_dest"],
    },
]
# fmt: on

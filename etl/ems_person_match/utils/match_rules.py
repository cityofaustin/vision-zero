"""
Hierarchical matching rules for linking EMS PCR records to CRIS people records.

Rules are applied sequentially from most to least restrictive. This ensures
high-confidence matches are made first.

Each rule specifies which attributes must match  between the
PCR and person record for the pairing to be accepted. The first rule that finds
a match wins, preventing the same person from being matched to multiple PCRs.
"""

# fmt: off
MATCH_RULES = [
    ["sex", "ethnicity", "age", "pos_in_vehicle", "travel_mode", "injury_severity"],
    ["sex", "ethnicity", "age", "pos_in_vehicle", "travel_mode"],
    ["sex", "ethnicity", "age", "pos_in_vehicle", "injury_severity"],
    ["sex", "ethnicity", "age", "pos_in_vehicle",],
    ["sex", "ethnicity", "age",  "injury_severity"],
    ["sex", "ethnicity", "age"],
    # low quality matches 👇
    ["sex", "ethnicity", "age_approx", "pos_in_vehicle"],
    ["sex", "age", "transport_dest"],
    ["sex", "age_approx", "transport_dest"],
    ["sex", "ethnicity", "age_approx"],
    ["sex", "age"],
    ["sex", "age_approx"],
    ["ethnicity", "age"],
    ["sex", "transport_dest"],
    ["transport_dest"],
]
# fmt: on

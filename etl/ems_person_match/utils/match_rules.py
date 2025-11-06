"""
Hierarchical matching rules for linking EMS PCR records to CRIS people records.

Rules are applied sequentially from most to least restrictive. This ensures
high-confidence matches are made first.

Each rule specifies which attributes must match  between the
PCR and person record for the pairing to be accepted. The first rule that finds
a match wins, preventing the same person from being matched to multiple PCRs.

The `match_score` indicates the quality of the match, as defined by the VZ
team. This value is used in the VZE to determine which matches need
manual review/QA.
"""
# fmt: off
MATCH_RULES = [
    { "match_score": 99, "match_attributes": ["sex", "ethnicity", "age", "pos_in_vehicle", "travel_mode", "injury_severity"],},
    { "match_score": 99, "match_attributes": ["sex", "ethnicity", "age", "pos_in_vehicle", "travel_mode"],},
    { "match_score": 99, "match_attributes": ["sex", "ethnicity", "age", "pos_in_vehicle", "injury_severity"],},
    { "match_score": 99, "match_attributes": ["sex", "ethnicity", "age", "pos_in_vehicle",],},
    { "match_score": 99, "match_attributes": ["sex", "ethnicity", "age",  "injury_severity"],},
    { "match_score": 99, "match_attributes": ["sex", "ethnicity", "age"],},
    { "match_score": 25, "match_attributes": ["sex", "ethnicity", "age_approx", "pos_in_vehicle"],},
    { "match_score": 25, "match_attributes": ["sex", "age", "transport_dest"],},
    { "match_score": 25, "match_attributes": ["sex", "age_approx", "transport_dest"],},
    { "match_score": 25, "match_attributes": ["sex", "ethnicity", "age_approx"],},
    { "match_score": 25, "match_attributes": ["sex", "age"],},
    { "match_score": 25, "match_attributes": ["sex", "age_approx"],},
    { "match_score": 25, "match_attributes": ["ethnicity", "age"],},
    { "match_score": 25, "match_attributes": ["sex", "transport_dest"],},
    { "match_score": 25, "match_attributes": ["transport_dest"],},
]
# fmt: on

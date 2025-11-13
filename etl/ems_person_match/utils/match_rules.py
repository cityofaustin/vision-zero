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
    { "match_score": 99, "match_attributes": ["sex", "age", "ethnicity", "pos_in_vehicle", "travel_mode", "injury_severity", "transport_dest"],},
    { "match_score": 99, "match_attributes": ["sex", "age", "ethnicity", "pos_in_vehicle", "travel_mode", "transport_dest"],},
    { "match_score": 99, "match_attributes": ["sex", "age", "ethnicity", "pos_in_vehicle", "travel_mode", "injury_severity"],},
    { "match_score": 99, "match_attributes": ["sex", "age", "ethnicity", "pos_in_vehicle", "travel_mode"],},
    { "match_score": 99, "match_attributes": ["sex", "age", "ethnicity", "pos_in_vehicle", "injury_severity"],},
    { "match_score": 99, "match_attributes": ["sex", "age", "ethnicity", "pos_in_vehicle",],},
    { "match_score": 99, "match_attributes": ["sex", "age", "ethnicity",  "injury_severity"],},
    { "match_score": 99, "match_attributes": ["sex", "age", "ethnicity", "transport_dest", "injury_severity"],},
    { "match_score": 99, "match_attributes": ["sex", "age", "ethnicity", "transport_dest"],},
    { "match_score": 99, "match_attributes": ["sex", "age", "ethnicity",],},
    { "match_score": 25, "match_attributes": ["sex", "age_approx", "ethnicity", "pos_in_vehicle"],},
    { "match_score": 25, "match_attributes": ["sex", "age_approx", "pos_in_vehicle"],},
    { "match_score": 25, "match_attributes": ["sex", "age", "transport_dest"],},
    { "match_score": 25, "match_attributes": ["sex", "age_approx", "transport_dest"],},
    { "match_score": 25, "match_attributes": ["sex", "age_approx", "ethnicity",],},
    { "match_score": 25, "match_attributes": ["sex", "age"],},
    { "match_score": 25, "match_attributes": ["sex", "age_approx"],},
    { "match_score": 25, "match_attributes": ["age", "ethnicity", ],},
    { "match_score": 25, "match_attributes": ["sex", "transport_dest"],},
    { "match_score": 25, "match_attributes": ["transport_dest"],},
]
# fmt: on

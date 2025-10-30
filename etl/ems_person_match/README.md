# EMS PCR to CRIS Person Matching ETL

## Overview

This ETL automatically matches Emergency Medical Services (EMS) Patient Care Records (PCRs) to Texas CRIS (Crash Report Information System) person records for the same traffic incident.

## Problem

EMS and CRIS systems independently record information about the same crash victims. PCRs are linked to crashes but not to specific people within those crashes, making it difficult to track patient outcomes and injury patterns.

## Solution

The script uses hierarchical attribute matching to link records:

1. **Fetches** unmatched EMS PCRs that have a crash_pk but no person_id
2. **Groups** PCRs by incident number
3. **For each incident:**
   - Retrieves all unmatched people from the associated CRIS crash
   - Compares each PCR against each person using demographic and incident attributes
   - Applies matching rules in order from most to least restrictive
   - Assigns the first valid match found
4. **Updates** the database with match results or flags records as unmatched

## Matching Attributes

- Demographics: sex, ethnicity, age (exact or ±3 years)
- Incident details: position in vehicle, injury severity, travel mode
- Transport: destination hospital (fuzzy string matching)

## Match Rules

Rules are tried sequentially, requiring progressively fewer attributes to match. This ensures high-confidence matches are made first, with fallback strategies for incomplete data.

## Output

- PCRs are updated with `person_id` and `person_match_status`
- Logs statistics showing match counts by rule type

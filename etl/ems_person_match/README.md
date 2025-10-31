# EMS PCR to CRIS Person Matching ETL

This ETL automatically matches Emergency Medical Services (EMS) Patient Care Records (PCRs) to CRIS person records for the same crash.

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

## Quick start

1. Start your local instance of the Vision Zero database and graphql API

2. Save a copy of `env_template` as `.env` in the root of this repo.

3. Create a Python environment and install the dependecies in `requirements.txt`, or use the provided Docker configuration:

```
docker build . -t atddocker/vz-ems-person-match:development
```

4. Run the ETL

```
docker run -it --rm --env-file .env atddocker/vz-ems-person-match:development python match_ems_to_people.py
```

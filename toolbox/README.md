# Toolbox

This is a collection of scripts which have been written to serve a one-time or infrequent purpose. They are not intended to be run in an automated fashion and commonly would be used from the command line when needed. They will each have different parameters and possible environment variables which need to be set for the script to function as intended.

## Contents

### Bulk user management - `bulk_user_management`

Helper script to disable or enable all VZ users through the Auth0 API.

### Data Model

Various scripts used as part of launching the new data model for VZ v2.0. We want to keep these around for the few months after launch (August 2024) but they can be archived in the near future.

### ArcGIS Online Layer Helper - `load_agol_layer`

Nodejs tool load ArcGIS Online (AGOL) layers into the Vision Zero database.

### Lookup table helper - `get_lookup_table_changes`

Script which compares lookup tables between a CRIS extract and the VZ database and generates database migrations. We should run this script after CRIS software releases.

### Crash Narrative Flagging

This script runs a Large Language Model (LLM) locally to flag input text as potentially containing personally identifiable information (PII).

## Archive

These toolbox scripts were deleted from the repository. Most of them are incompatible with v2.0 of our database. These deletions were committed at hash `569511cc0d598120be4146920623f55c1a8501a3`.

##### `s3_restore_cr3_pdfs/`

This contains a Python script will take a JSON file of crash ids, and download and check the CR3 file stored in S3 for each crash. It will verify the type of file using the `libmagic` library will restore the most recent `application/pdf` from the S3 version history of the file.

##### `reposition_crashes_to_centroid_svrd_locations/`

This is a Python script which will use a database view to find the set of crashes which:

- Are on a level 5 centerline,
- Have CR3 data which indicates that the crash occurred on a service road,
- Have a directionality which gives a hint which way off the centerline the crash should be moved.

For these crashes, the script will add 0.00000001 decimal degrees to the latitude of the crash, which is an immaterial movement in geographic terms, but it will cause the lambda function tied to crash-updates to execute. It is this lambda function which will figure out what location to move the crash to and will do so.

#### `direction_movement`

This is a tool created to address a specific issue the Austin Transportation Department ran into as a result of a CRIS updating certain geospatial resources and reprocessing the entire corps of crashes. This CRIS process caused all crashes to be redelivered to ATD and run through the ETL which loads them into the Vision Zero Crash Database. Due to a particular configuration around the fields `movement_id` and `travel_direction`, changes to these fields which had been made by VZ stakeholders were reverted to the value provided from CRIS.

While it is unlikely that other installations of the Vision Zero crash system would need this tool chain as-is, it does provide an example implementation of restoring data from the change log entries. As an aside, during the course of this work, there have been certain modifications to the Vision Zero change log system identified which would facilitate this type of data recovery in the future.

To use this toolchain:

- Spin up the postgres image noted in the `Dockerfile` via the `docker-compose.yml` configuration.
- Load a current copy of the VZDB and a copy of a backup from prior to the changes you wish to recover from. These go into the databases `current_vz` and `past_vz` respectively.
- Create a scratch table to hold your results as shown in `result_table.sql`
- `direct_comparison_change_finder.py` can be run to populate a the result table.
- `find_aux_data.py` can be used to populate auxiliary data from the VZDB into your result scratch table
- In the implementation shown here, this result set was presented to stakeholders and further criteria were given, as found in the view created in `view_with_stakeholder_feedback_criteria.sql`.
- This view will include a column called `update_statement` which can be used as a series of updates to execute the data restoration.

#### `fix_cr3_stored_fl`

Gets a list of crash ids we have CR3 PDFs for in our AWS S3 bucket and checks them against crashes in the atd_txdot_crashes table where cr3_stored_flag = 'Y'. Updates cr3_stored_flag to 'N' if those crash IDs aren't in the list of CR3s we have.

#### `insert_needed_lkp_tables`

An iteration of the lookup table helper script. See `get_lookup_table_changes` instead

#### `cris_export_parser`

Tool to inspect CRIS extract CSVs and compare them against the database tables

#### `coordination_partners_migration`

One off script to help migrate recommendation coordination partners to a related table.

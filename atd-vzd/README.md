## Vision Zero Database

Currently the Vision Zero database consists of a Postgres 10 database that mirrors the CRIS public crash data format, with added field lookup tables.

At the moment, only the schema, views and triggers are posted on here and version-controlled. The actual data can be gathered from the [CRIS website]([https://cris.dot.state.tx.us](https://cris.dot.state.tx.us/)). 

Currently the schema is being tracked in the following folders:

- `schema`- Folder contains the original table definitions, 

- `migrations` - Contains sql modifications to the original files in schema, all timestamped with date and time in a `yyyy-mm-dd--hhmm` format.
- `views` - Contains SQL views.
- `triggers` - Contains SQL triggers.
- `hasura` - Contains Hasura metadata files.

## Pipeline

Currently there is no automated pipeline implemented yet; as of this iteration the modifications are made manually.

## Backups

Currently there are two systems making backups, one in RDS and the other in S3 via CRON jobs for 60 days. The backups in S3 are table-based and contain both schema and data for each individual table. 


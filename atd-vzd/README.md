## Vision Zero Database

Currently the Vision Zero database consists of a Postgres 10 database that mirrors the CRIS public crash data format, with added field lookup tables.

At the moment, only the schema, views and triggers are posted on here and version-controlled. The actual data can be gathered from the [CRIS website]([https://cris.dot.state.tx.us](https://cris.dot.state.tx.us/)). 

Currently the schema is being tracked in the following folders:

- `schema`- Contains the original table definitions, 
- `migrations` - Contains sql modifications to the original files in schema, all timestamped with date and time in a `yyyy-mm-dd--hhmm` format. [More info about migrations in this README](./migrations/README.md)
- `views` - Contains SQL views.
- `triggers` - Contains SQL triggers.
- `hasura` - Contains Hasura metadata files.

## Pipeline

Currently there is no automated pipeline implemented yet; as of this iteration the modifications are made manually.

## Backups

Currently there are two systems making backups, one in RDS and the other in S3 via CRON jobs for 60 days. The backups in S3 are table-based and contain both schema and data for each individual table. 

## Hasura
We deployed a standard Hasura container to work as an API  between Postgres and atd-vze. For more information on how it works, please refer to their [website](https://hasura.io) and documentation. 

## Metabase
We use a standard metabase container for business intelligence analytics as well as other solutions in the cloud (ie. QuickSight), while not part of the canonical stack, you may see references of this in the database schema definitions, triggers or views.


## How to manually add columns to a table for VZD

### Postgres changes

1. On the staging database `atd_vz_data_staging`, make changes to your data structure either with a GUI (ex: TablePlus) or with SQL statements. 

2. Once you changes have been made, copy the SQL statement that modified the table to our [migrations folder](/migrations) for version control. Example: 
 ```sql
  ALTER TABLE "public"."atd_txdot_crashes" ADD COLUMN "micromobility_device_flag" varchar(1) NOT NULL DEFAULT 'N';
  ```
3. Execute the same SQL statement on the production database `atd_vz_data`

### Hasura changes

In the case of adding new database columns, you will need to update the permission in the Hasura UI to make new columns editable or available to the relevant permission groups.

4. In the vzd-staging Hasura site, go to the permissions page for the table you're editing
   - Ex: https://vzd-staging.austintexas.io/console/data/schema/public/tables/atd_txdot_crashes/permissions
5. Update which roles can select or update records.
6. Click the Settings gear icon in the top right corner of the Hasura page (or go to: https://vzd-staging.austintexas.io/console/settings/metadata-actions) and click "Export metadata" to get a son config from the staging environment.
7. Go to the production Hasura site on the equivalent Settings page (https://vzd.austintexas.io/console/settings/metadata-actions) and click "Import metadata". Select the file that was just exported from the staging site (ex: metadata.json)
8. Confirm that the permission you previously added to the staging site have been copied to production with your metadata import.

# Vision Zero Database (VZD)

The Vision Zero Database (VZD) is a Postgresql database that serves as the central repository Austin's traffic crash data. The database is fronted with a GraphQL API, powered by [Hasura](https://github.com/hasura/graphql-engine), which is also used to manage schema migrations.

The designed supports a sophisticated editing environment which enables Vision Zero program staff to edit and enrich crash data, while also allowing record updates to flow into the database from upstream sources, such as the TxDOT Crash Information System (CRIS).

![vision zero data flow](../docs/images/data_flow.png)

- [Data sources](#data-sources)
  - [TxDOT Crash Records Information System (CRIS)](#txdot-crash-records-information-system-cris)
  - [Austin Fire Department (AFD) and Travis County Emergency Medical Services (EMS)](#austin-fire-department-afd-and-travis-county-emergency-medical-services-ems)
  - [Geospatial layers](#geospatial-layers)
- [Common maintenance tasks](#common-maintenance-tasks)
- [Audit fields and change logs](#audit-fields-and-change-logs)
- [Backups](#backups)
- [Hasura](#hasura)
- [Development and deployment](#development-and-deployment)

## Data sources

### TxDOT Crash Records Information System (CRIS)

The [TxDOT Crash Record Information System](https://www.txdot.gov/data-maps/crash-reports-records/crash-data-analysis-statistics.html), CRIS, is a statewide, automated database for traffic crashes reports.

CRIS data accounts for the vast majority of records in the database: the [Vision Zero Editor (VZE)](../atd-vze/README.md) is designed primarily as a tool for editing and enriching data received from CRIS, and the [Vision Zero Viewer (VZV)](../atd-vzv/README.md) is powered entirely by enriched CRIS data.

The CRIS data in our database consists of four record types:

- `crashes` - each row is single crash event, with attributes such as the crash timestamp, crash location, and manner of collision
- `units` - each row describes a unit, or vehicle, involved in a crash. Each unit relates to one crash record.
- `people` - each row describes a person involved in a crash. Each person relates to one unit.
- `charges` - each row descibes a legal charge filed by the responding law enforcement agency. Each charge relates to one person. Note that charges have special handling and only exist in the `charges_cris`, as described in detail below.

#### Design

The core challenge that the Vision Zero database solves is to store CRIS data in a central repository where it can be reviewed and updated City of Austin staff. The database preserves the integrity of staff members' edits while simultaneously allowing crash record updates to flow into the database from CRIS.

The editing environment is achieved by managing multiple copies of each of the `crashes`, `units`, and `people` tables, so that CRIS edits and Vision Zero staff edits remain isolated.

For example, the `crashes` records are managed in three tables:

- `crashes_cris`: stores crash records that are created and updated by TxdDOT CRIS through the [CRIS import ETL](../atd-etl/cris_import/README.md)
- `crashes_edits`: stores crash record edits created by Visio Zero staff through the Vision Zero Editor web app
- `crashes`: stores a unified version of each record which combines the values in `crashes_cris` plus any values in `crashes_edits`

As pictured in the diagram below, the typical data flow for a crash record is as follows:

1. A new record is inserted into the `crashes_cris` table through the [CRIS import ETL](../atd-etl/cris_import/README.md).
2. On insert into `crashes_cris`, an "empty" copy of the record is inserted into the `crashes_edits` table. The record is inserted into the `crashes_edits` table with null values in every column except the `id`, which has a foreign key constaint referencing the `crashes_cris.id` column.
3. At the same time, a complete copy of the record is inserted into the `crashes` table.
4. A Vision Zero Editor user may update a crash records b updating rows in the the `crashes_edits` table. When an update is received, a trigger function coalesces each value in the `crashes_edits` table with the corresponding value in the `crashes_cris` table. The resulting record—which contains the original CRIS-provide values plus any edit values made through user edits—is applied as an update to corresponding record in the `crashes` table.
5. Similarly, when an existing `crashes_cris` record is updated through the CRIS import ETL, the updated record is coalseced against the corresponding row in the `crashes_edits` table, and result is saved in the `crashes` table.
6. Finally, once a record is updated in the `crashes` table, additional trigger functions apply various business rules and enrich the row with spatial attributes based on it's location. These trigger functions are reserved for values that require heavy computation—additional business rules can be applied through table views.

![CRIS editing model](../docs/images/cris_data_model.png)
_The "layered" editing environment of the Vision Zero Database_

The process for updating `units` and `people` behaves in the same manner as `crashes`.

#### "Temporary" records

### CRIS Extract configuration and accounts

#### CRIS data processing

We receive CRIS data from TxDOT on a nightly basis through the CRIS "automated interface", which delivers an encrypted `.zip` file to an S3 bucket on our AWS premise. The `.zip` file contains all crash records _process_ in the last 24 hours, and includes both CSV files and crash report PDFs (aka CR3s).

At the time of writing, [this guide](https://www.txdot.gov/content/dam/docs/crash-records/cris-guide.pdf) provides an overview of how CRIS data delivery is configured.

For more details on how we ingest CRIS data into our database, see the [CRIS import ETL documentation](../atd-etl/cris_import/README.md).

#### Lookup tables

- customization and constraints
- helper script

#### Charges records

Charges records are provided by CRIS and descibe a legal charge filed by the responding law enforcement agency. These records require special handling in our database because CRIS does not provide a unique primary key column for charges. Here's what you should know about these records:

1. Charge records only exist in the `charges_cris` table and do not have corresponding `charges_edits` or `charges` tables.
2. During the CRIS import, all charge records are **deleted** from the database for any crash ID present in the CRIS extract. After deletion, the CRIS import ETL inserts all charges records present in the extract.
3. The CRIS import ETL filters out charge records where the `charge` value is `NO CHARGE`—this reduces the number of charge records in the database by many thousands.
4. Because charges are subject to deletion, they are not editable through the VZE/graphql API and should be considered read-only.

#### Special insert triggers

- crash_pk setters

### Austin Fire Department (AFD) and Travis County Emergency Medical Services (EMS)

### Geospatial layers

## Common maintenance tasks

### Add a new CRIS-managed column to `crashes`, `units`, or `people`

Follow these steps to add a new column to the database that will be sourced from CRIS. See [PR #1546](https://github.com/cityofaustin/atd-vz-data/pull/1546) as an example.

1. Remember that all database operations should be deployed through migrations. See the [development and deployment](#development-and-deployment) docs.
2. Add the new column to all three tables of the given record type. For example, if this is a crash-level column, add the column to the `crashes_cris`, `crashes_edits`, and `crashes` tables.
3. Modify the trigger function that inserts new rows into the the `_edits` and unified table that corresponds to the record type you are modifiying: either the `crashes_cris_insert_rows()`, `units_cris_insert_rows()`, ot the `people_cris_insert_rows()` function. Locate the part of the function that selects all values from the new `_cris` record and inserts into the unified table. This should be obvious, because all column names are listed in this function. Add your new column name to accordingly function.
4. Next, you will need to add your new column to the `_column_metadata` table, so that the CRIS import ETL is aware that this column should be included in imports. For example:

```sql
insert into _column_metadata (column_name, record_type, is_imported_from_cris)
values ('drvr_lic_type_id', 'people', true);
```

5. When you're ready to test the trigger behavior, you can enable debug messaging for this trigger by excuting the command `set client_min_messages to debug;`. This will cause the trigger debug messages to log to your SQL client.

6. Re-apply hasura metadata to ensure that your new column is known to the graphql API. You do not need to modify the metadata unless you want to add select, insert, and/or update permissions to this column for non-admin users.

```shell
# ./atd-vzd
$ hasura metadata apply
```

7. You are now ready to test your new column using the CRIS import ETL. If you need to backfill this new column for old records, you will need to manually request the necessary CRIS extract zip files so that they can be processed by an ad-hoc run of the CRIS import ETL.

### Add a custom column to `crashes`, `units`, or `people`

Follow these steps to add a custom, non-CRIS column to `crashes`, `units`, or `people`.

1. Remember that all database operations should be deployed through migrations. See the [development and deployment](#development-and-deployment) docs.

2. Add your new column to the `_edits` and unified table for the given record type. For example, if this is a crash-level column, add the column to the `crashes_edits` and `crashes` tables.

3. Unlike adding a CRIS-managed column, you do not need to modify any trigger functions, because the `_edits` trigger functions (`crashes_edits_update`, `units_edits_update`, `people_edits_update`) do not rely on hard-coded column names.

4. Next, add your new column to the `_column_metadata` table and indcate that it should _not_ be imported by CRIS.

```sql
insert into _column_metadata (column_name, record_type, is_imported_from_cris)
values ('vz_custom_column', 'crashes', false);
```

5. When you're ready to test the trigger behavior, you can enable debug messaging for this trigger by excuting the command `set client_min_messages to debug;`. This will cause the trigger debug messages to log to your SQL client.

### Adding a computed or generated field to `crashes`, `units`, or `people`

Follow these steps to add a computed or generated field to `crashes`, `units`, or `people`.

1. Remember that all database operations should be deployed through migrations. See the [development and deployment](#development-and-deployment) docs.

2. Computed or generated fields should be added to the unified record table only. For example, if this is a crash-level column, add the column to the `crashes` tables.

3. If your column will be modified by a trigger function or generated column definition, be sure to inspect the table's existing triggers and generated fields and [understand their execution order](https://www.postgresql.org/docs/current/trigger-definition.html).

4. Lastly, add your new column to the `_column_metadata` table and indcate that it should _not_ be imported by CRIS.

```sql
insert into _column_metadata (column_name, record_type, is_imported_from_cris)
values ('my_generated_column', 'crashes', false);
```

5. When you're ready to test the trigger behavior, you can enable debug messaging for this trigger by excuting the command `set client_min_messages to debug;`. This will cause the trigger debug messages to log to your SQL client.

### Add a custom lookup value to the database

### Debugging record triggers

## Audit fields and change logs

## Backups

RDS

## Hasura

We deployed a standard Hasura container to work as an API between Postgres and atd-vze. For more information on how it works, please refer to their [website](https://hasura.io) and documentation.

## Development and deployment

Changes to the schema and database are handled by CI (GitHub Action workflow) that applies migrations and metadata using the [Hasura CLI](https://hasura.io/docs/latest/hasura-cli/overview/).

### Generating migrations and metadata changes

- Merge the latest code from the `master` branch into your feature branch to make sure you have the latest migrations that are applied to the staging database
- Start up the local database and Hasura engine and replicate using the latest production data dump
- To make sure your local database is up to date with the current changes in `master` branch, run:

```bash
hasura migrate apply --envfile .env.local
hasura metadata apply --envfile .env.local
```

- Start the local Hasura console and make any changes needed which will then reflect in your project folder

### Merging an approved feature branch

We need to check the order of migrations against those in the `master` branch **before merging a feature branch** so that we can make updates to the migration version order if needed. The version refers to the timestamp in the migration folder name.

To check migrations for any conflicts with the latest migrations in the `master` branch:

- Make sure that your branch is up to date with `master`
- Check to make sure no one else is actively merging their work and coordinate if needed
- Update the migration versions in your branch so they are the newest migrations if needed
- Start up the local database and Hasura engine and replicate using the latest production data dump
- Then, run:

```bash
hasura migrate apply --envfile .env.local
hasura metadata apply --envfile .env.local
```

Once we see that no errors occur when applying the sequence of migrations locally, we can merge and the CI will apply the new migrations and metadata to the staging database.

<!-- Production site: http://vzd.austinmobility.io/ -->
<!-- Staging site: https://vzd-staging.austinmobility.io/ -->

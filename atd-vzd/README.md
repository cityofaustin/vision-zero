## Vision Zero Database

Currently the Vision Zero database consists of a Postgres 10 database that mirrors the CRIS public crash data format, with added field lookup tables.

At the moment, only the schema, views and triggers are posted on here and version-controlled. The actual data can be gathered from the [CRIS website](<[https://cris.dot.state.tx.us](https://cris.dot.state.tx.us/)>).

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

We deployed a standard Hasura container to work as an API between Postgres and atd-vze. For more information on how it works, please refer to their [website](https://hasura.io) and documentation.

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

---

_WIP Updates for Hasura 2.0 Upgrades_

# Vision Zero Database

You may want to check the documentation in the [MOPED Technical Docs](https://app.gitbook.com/@atd-dts/s/moped-technical-docs/dev-guides/hasura-migrations) for examples of migrations and working with newer versions of Hasura.

## Getting Started

#### 1. Install Docker & Docker Compose

You will want to follow the docker documentation on how to install docker in your system.

For Mac: https://docs.docker.com/docker-for-mac/install/

For Windows: https://docs.docker.com/docker-for-windows/install/

#### 2. Install the Hasura CLI

In your Terminal, run the following command:

```
curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash
```

This will install the Hasura CLI in /usr/local/bin. You might have to provide your sudo password depending on the permissions of your /usr/local/bin location.

If you’d prefer to install to a different location other than /usr/local/bin, set the env var INSTALL_PATH:

```
curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | INSTALL_PATH=$HOME/bin bash
```

There is another way to install Hasura via npm, but if you managed to install with the steps above you already have the super-powers you need to start working with migrations.

**Installation - Windows:** Download the binary cli-hasura-windows-amd64.exe available under Assets of the latest release from the GitHub release page: https://github.com/hasura/graphql-engine/releases
Rename the downloaded file to hasura. You can add the path to the environment variable PATH for making hasura accessible globally.

For more info, refer to their documentation:
https://hasura.io/docs/1.0/graphql/core/hasura-cli/install-hasura-cli.html

#### 3. The Hasura Cluster Helper

There is a tool we've created that has a few shortcuts available, it's called [hasura-cluster](https://github.com/cityofaustin/atd-vz-data/blob/main/atd-vzd/hasura-cluster).
This just a bash script that runs a few docker-compose commands.

Syntax:

```
$ ./hasura-cluster <command> <params>
```

[1] Set your environment:

```
$ ./hasura-cluster setenv local
```

[2] Start the cluster:

```
$ ./hasura-cluster start
```

[3] Start the hasura console (press Ctrl+C to stop)

```bash
$ ./hasura-cluster console
# - or -
$ hasura console
```

[4] Stop the cluster (whenever you are finished):

```
$ ./hasura-cluster stop
```

### Hasura-Cluster Reference

- `run_migration`: Runs all 3 hasura migrations: database, metadata, seed data.
- `start_only`: Starts the cluster and does NOT run migrations.
- `start`: Starts the cluster and runs all migrations.
- `stop`: Stops the cluster, removes any volumes left out.
- `prune`: Deletes any volumes left out by the cluster.
- `follow`: Shows the logs for the running cluster.
- `status`: Displays the current status of the cluster
- `setenv`: Changes the current environment.

#### Hasura-Cluster SetEnv:

What `setenv` really does is to copy an existing file from the ./config folder into
the current folder and renames it into `config.yaml`. The `hasura` command (CLI) will
read its settings from `config.yaml`.

For example, there should only be a file in the ./config folder called `hasura.local.yaml`
which contains the connection information for the local cluster. Notice the format
`hasura.<environment>.yaml`. If for example, you need to connect the Hasura Staging cluster,
you would need to create a new file called `hasura.staging.yaml`, provide all the info,
then run `$ hasura-cluster setenv staging` and `hasura console`.

## Read the docs

More documentation is available in the [MOPED Technical Docs](https://app.gitbook.com/@atd-dts/s/moped-technical-docs/dev-guides/hasura-migrations)

You are also encouraged to learn [Hasura Migrations from their documentation](https://hasura.io/docs/1.0/graphql/core/migrations/index.html).

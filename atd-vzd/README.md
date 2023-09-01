## Vision Zero Database

Currently the Vision Zero database consists of a Postgres 14 database that mirrors the CRIS public crash data format with added field lookup tables.

CRIS data can be gathered from the [CRIS website]([https://cris.dot.state.tx.us](https://cris.dot.state.tx.us/)). 

## Backups

Currently there are two systems making backups, one in RDS and the other in S3 via CRON jobs for 60 days. The backups in S3 are table-based and contain both schema and data for each individual table. 

## Hasura

We deployed a standard Hasura container to work as an API between Postgres and atd-vze. For more information on how it works, please refer to their [website](https://hasura.io) and documentation. 


## Pipeline

Changes to the schema and database are currently handled by manually applying migrations and metadata through the [Hasura CLI](https://hasura.io/docs/latest/hasura-cli/overview/). Run CLI commands from the local `atd-vzd` folder with a feature branch checked out. The CLI will often prompt you to choose which database to inspect (All or default). Default is the only database being tracked so either choice works.

### Setting up Hasura CLI to target an environment

To provide the CLI with the credentials needed to reach the local, staging, or production engine, we can use environment files.

For example:
```bash
hasura migrate status --envfile .env.local
```
The `.env.local` is already present in this folder with the local credentials.

The `.env.staging` file should contain:
```
HASURA_GRAPHQL_ENDPOINT=https://vzd-staging.austinmobility.io
HASURA_GRAPHQL_ADMIN_SECRET=<Found in 1Password entry named 'VZD - Staging - Hasura Admin key'>
```

**The production endpoint and secret should only be used for a release.**

### Generating migrations and metadata changes

- Pull `master` branch to make sure you have the latest migrations that are applied to staging
- Start up the local database and Hasura engine and replicate using the latest production data dump
- To make sure your local database is up to date with the current staging changes, run:
```bash
hasura migrate apply --envfile .env.local
hasura metadata apply --envfile .env.local
``` 
- Start the local Hasura console and make any changes needed which will then reflect in your project folder
### Merging an approved feature branch

We need to check the status of new migrations against staging **before merging a feature branch** so that we can make updates to the migration version order if needed. The version refers to the timestamp in migration folder name.

To check the status from your local project folder, run:
```bash
hasura migrate status --envfile .env.staging
```

Check that your new migration shows `NOT PRESENT` in the `DATABASE` column and that it is also the last row in the table shown. We need to make sure that migrations are applied in the same order.

If the new migration is not the last migration to apply in the sequence:
- Make sure that your branch is up to date with `master`
- Check to make sure no one else is actively merging their work and coordinate if needed
- Update the migration version in your project so it is the newest migration
- Test locally using the steps in the  [Generating migrations and metadata changes section](#generating-migrations-and-metadata-changes)

Once everything looks good, we can apply the migrations and metadata to staging and merge the feature branch.

```bash
hasura migrate apply --envfile .env.staging
hasura metadata apply --envfile .env.staging
``` 

## Vision Zero Database

Currently the Vision Zero database consists of a Postgres 14 database that mirrors the CRIS public crash data format with added field lookup tables.

CRIS data can be gathered from the [CRIS website](<[https://cris.dot.state.tx.us](https://cris.dot.state.tx.us/)>).

## Backups

Currently there are two systems making backups, one in RDS and the other in S3 via CRON job on the bastion host used with the Vision Zero database. The cron stores daily database dump files in `s3://atd-vision-zero-database/production-database-pg_dump-export` that can be utilized to restore the local database with production data.

## Hasura

We deployed a standard Hasura container to work as an API between Postgres and the Vision Zero Editor. For more information on how it works, please refer to their [website](https://hasura.io) and documentation.

## Pipeline

Changes to the schema and database are handled by CI (GitHub Action workflow) that applies migrations and metadata using the [Hasura CLI](https://hasura.io/docs/latest/hasura-cli/overview/).

### Generating migrations and metadata changes

- Merge the latest code from the `main` branch into your feature branch to make sure you have the latest migrations that are applied to the staging database
- Start up the local database and Hasura engine and replicate using the latest production data dump
- To make sure your local database is up to date with the current changes in `main` branch, run:

```bash
hasura migrate apply --envfile .env.local
hasura metadata apply --envfile .env.local
```

- Start the local Hasura console and make any changes needed which will then reflect in your project folder

### Merging an approved feature branch

We need to check the order of migrations against those in the `main` branch **before merging a feature branch** so that we can make updates to the migration version order if needed. The version refers to the timestamp in the migration folder name.

To check migrations for any conflicts with the latest migrations in the `main` branch:

- Make sure that your branch is up to date with `main`
- Check to make sure no one else is actively merging their work and coordinate if needed
- Update the migration versions in your branch so they are the newest migrations if needed
- Start up the local database and Hasura engine and replicate using the latest production data dump
- Then, run:

```bash
hasura migrate apply --envfile .env.local
hasura metadata apply --envfile .env.local
```

Once we see that no errors occur when applying the sequence of migrations locally, we can merge and the CI will apply the new migrations and metadata to the staging database.

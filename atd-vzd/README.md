## Vision Zero Database

Currently the Vision Zero database consists of a Postgres 14 database that mirrors the CRIS public crash data format with added field lookup tables.

CRIS data can be gathered from the [CRIS website]([https://cris.dot.state.tx.us](https://cris.dot.state.tx.us/)). 

## Backups

Currently there are two systems making backups, one in RDS and the other in S3 via CRON job on the bastion host used with the Vision Zero database. The cron stores daily database dump files in `s3://atd-vision-zero-database/production-database-pg_dump-export` that can be utilized to restore the local database with production data.

## Hasura

We deployed a standard Hasura container to work as an API between Postgres and atd-vze. For more information on how it works, please refer to their [website](https://hasura.io) and documentation. 


## Pipeline

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

We need to check the status of new migrations against the staging Hasura engine **before merging a feature branch** so that we can make updates to the migration version order if needed. The version refers to the timestamp in migration folder name.

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

Once everything looks good, we can merge and the CI will apply the new migrations and metadata to the staging database.

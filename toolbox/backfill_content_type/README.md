# Backfill CR3 PDF content type

This script set's the `ContentType` header of all CR3 PDFs in our S3 bucket.

See https://github.com/cityofaustin/atd-data-tech/issues/24384.

## Quick start

1. Configure `.env` file based on `env_template`. Set the `BUCKET_ENV` var to the desired S3 bucket env subdirectory
2. `docker compose build`
3. `docker compose run backfill`

# CRIS Import ETL

This ETL manages the processing and importing of TxDOT CRIS data into the Vision Zero database.

The following scripts are available:

- **`cris_import.py`**: the primary data import script which processes both CSV files and Crash Report PDF crash reports.
- **`cr3_ocr_narrative.py`**: a utility script which extracts crash narrative data from CR3 PDFs using Optical Character Recognition (OCR)
- **`_restore_zips_from_archive.py`**: a development helper script that moves CRIS extract zips from `./archive` to `./inbox` in the S3 bucket.

## Quick start - CRIS import

1. Start your local Vision Zero cluster (database + Hasura + editor).

2. Save a copy of the `env_template` file as `.env`, and fill in the details. Set the `BUCKET_ENV` variable to `dev` in order to safely run the S3 operations locally.

3. Build and run the docker image. This will drop you into the docker image's shell:

```shell
docker compose build # <- do this once, and when dependencies change
docker compose run cris_import
```

4. Run the CRIS import script. This will download any extracts available in S3, load the CSV crash records into the database, crop crash diagrams out of the Crash Report PDFs, and upload the Crash Report PDFs and crash diagrams to the s3 bucket.

```shell
# from the cris_import container's shell
$ ./cris_import.py --s3-download --s3-upload --csv --pdf
```

## Environment

Create your environment by saving a copy of the `env_template` file as `.env`. The template includes default values for local development. See the password store for more details.

All interactions with AWS S3 occur against a single bucket which has subdirectores for the `dev` and `prod` environments. If you set your `BUCKET_ENV` to `dev` you can safely run this ETL's S3 operations.

```
BUCKET_ENV=dev
HASURA_GRAPHQL_ENDPOINT=http://localhost:8084/v1/graphql
HASURA_GRAPHQL_ADMIN_SECRET=hasurapassword
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
BUCKET_NAME=
EXTRACT_PASSWORD=
```

## CRIS Import - `cris_import.py`

This is the primary data import script which processes both CSV files and Crash Report PDFs. It supports a number of CLI args, with usage examples described below.

```shell
  --csv              Process CSV files. At least one of --csv or --pdf is required.
  --pdf              Process Crash Report pdfs. At least one of --csv or --pdf is required.
  --s3-download      Source zip extracts from S3 bucket
  --s3-upload        Upload Crash Report pdfs and diagrams to S3 bucket
  --s3-archive       If using --s3-download, move the processed extracts from ./inbox to ./archive when done
  --skip-unzip       Only process files that are already unzipped in the local directory
  --verbose, -v      Sets logging level to DEBUG mode
  --workers <int>    The number of concurrent workers to use when processing PDFs
```

### Production run

This is the expected invocation during a production deployment. It will download any extracts available in S3, load the CSV crash records into the database, crop crash diagrams out of the Crash Report PDFs, upload the Crash Report pdfs and crash diagrams to the s3 bucket. It also makes use of the `--workers` flag to increase the size of the processing pool to `8`.

This invocation also "archives" the extract zips by moving them from `./inbox` to `./archive` subdirectory of the S3 bucket.

```shell
# from the cris_import container's shell
$ ./cris_import.py --s3-download --s3-upload --s3-archive --csv --pdf --workers 8
```

### Local import

Process any extract zips in your local `./extracts` directory. CSVs will be loaded into the db, and crash diagrams will be extracted but not uploaded to S3.

```shell
$ ./cris_import.py --csv --pdf
```

### Un-archive

During local development, you may want to restore the zips to the `./inbox` after archiving them. Use the helper script for that. It will prompt you for confirmation before executing this step, since the production bucket archive may contain hundreds of extracts.

```shell
$ python _restore_zips_from_archive.py
```

### Other flags

```shell
# process any unzipped extract CSVs you have in your `./extracts` directory
$ ./cris_import.py --skip-unzip --csv

# process pdfs with more workers and in debug mode
$ ./cris_import.py --pdf --skip-unzip --s3-upload --workers 8 --verbose
```

## CR3 Narrative Extraction - `cr3_ocr_narrative.py`

This utility script extracts crash narrative data from CR3 PDFs using Optical Character Recognition (OCR). Although CRIS provides an `investigator_narrative` column, it is often blank due to an unknown CRIS issue tracked [here](https://github.com/cityofaustin/atd-data-tech/issues/18971).

_Note: CR4 forms are skipped because CRIS now provides the narrative directly in the CSV data, so OCR extraction is not needed (we hope)._

It supports the `--verbose` flag to enable debug logging, and the number of concurrent workers can be set with the `--workers` flag.

```shell
 ./cr3_ocr_narrative.py --verbose --workers 4
```

## Debugging using the `_cris_import_log`

Whenever this ETL processes an extract, it logs metadata about the extract in the `_cris_import_log` table in the database. You can query this log to see details about extracts which have been processed.

```sql
select * from _cris_import_log order by id desc;
```

The import log provides the following information:

| column              | description                                                               |
| ------------------- | ------------------------------------------------------------------------- |
| `id`                | The serial ID primary key                                                 |
| `object_path`       | The location within the bucket where the extract was found                |
| `object_name`       | The name of the object (file) within the bucket                           |
| `created_at`        | Audit field for when the import started                                   |
| `completed_at`      | Audit field for when the import finished                                  |
| `records_processed` | A JSON blob that contains counts or a list of crashes imported per schema |

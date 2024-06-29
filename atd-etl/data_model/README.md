# CRIS Import ETL

These scripts manage the processing and importing of TxDOT CRIS data into the Vision Zero database.


## Getting started


### Environment

Create your environment by savig a copy of the `env_template` file as `.env`. The template includes default values for local development. See the password store for more details.

```
ENV=dev
HASURA_GRAPHQL_ENDPOINT="http://localhost:8084/v1/graphql"
AWS_ACCESS_KEY_ID=  `#
AWS_SECRET_ACCESS_KEY=
BUCKET_NAME=
EXTRACT_PASSWORD=
```

### Usage

The only script that should be run directly is `cris_import.py`. It supports the following 

```
  --csv              Only process CSV files
  --pdf              Only process CR3 pdfs
  --s3-download      Source zip extracts from S3 bucket
  --s3-upload        Upload cr3 pdfs and digrams to S3 bucket
  --skip-unzip       Only process files that are already unzipped in the local directory
  --verbose, -v      Sets logging level to DEBUG mode
  --skip-s3-archive  If using --s3-download, do not move the processed extracts to the archive directory
```

## Local development / testing

1. Start your local Vision Zero cluster (database + Hasura).

2. Save a copy of the `env_template` file as `.env`, and fill in the details. 

3. Use `docker compose` to build and run the docker image. This will drop you into the docker image's shell:

```shell
$ docker compose build
$ docker compose run cris_import
```

4. Run the main script. This will download an extrat from S3, load the CSV crash records into the database, and process CR3s (but upload them nowhere)

```shell
# from the cris_import container's shell
$ ./cris_import.py --download-s3 --skip-s3-archive
```

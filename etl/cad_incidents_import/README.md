# CAD Incident Import ETL

This ETL manages the processing and importing of Computer Aided Distpatch (CAD) data into the Vision Zero database.

## Background

These records contain information on 911 calls  and officer-initiated incidents related to traffic crashes as recorded in the Austin public safety Computer Aided Dispatch (CAD) system. They are referred to colloquially as "CAD calls".

Data is provided by the public safety enterprise data team and has been reviewed and approved by subject matter experts at the Austin Fire Department, Austin Police Department, and Austin-Travis County EMS.

## Data flow

![diagram](docs/diagram.png)

This data is sourced from the public safety data warehouse, which is maintained by the Austin Technology Services department (ATS). They have configured two views for us which are exported to a shared COACD network folder on a daily basis.

Data is imported into our database via a two step process:

- `incidents_to_s3.py`: Copies daily extract files from the shared network drive to AWS S3
- `incidents_import.py`: Loads the daily extract files into the Vision Zero database

This shared network drive is mounted to our on-prem ETL server at `/mnt/vision_zero_cad`, and the scripts in this repo can be configure to use that mount path or a local file as needed (see **Local Development**).

## Daily extract files

We process two distinct files on a daily basis:

- The CAD incident incident file, in which each row is a crash-related CAD incident responded to by AFD, EMS, or APD. Sample filename: `TPWCADTrafficSafetyDaily_20260410.CSV`

- The incident group file, which provides metadata about incident group relationships. The incident group file is not well understood, but should be helpful in the future as we try to link CAD records to same crash incident response. Sample filename: `PWCADTrafficSafetyDaily_20260410.CSV`.

Each daily file contains the five previous days of records up to the moment the file is generated. Files are processed as upserts, as records may be updated in the intervening days by the CAD system. 

## Local development

1. Save a copy of the `env_template` file as `.env`, and fill in the details. Make sure to set the `BUCKET_ENV` variable to `dev` in order to safely run the S3 operations locally.

2. Get test data

```shell
scp get_files@now
```

3. Start your local Vision Zero cluster (database + Hasura + editor).

4. Build the docker image using `docker compose`, this is only necessary the first time you run the script, or when updating Python package dependencies.

```shell
docker compose build
```

5. In order to emulate the network volume mount on the prod server, you'll run locally with an extra docker compose file that mounts at `/mnt/vision_zero_cad`.


```shell
docker compose -f docker-compose.yml -f docker-compose.local.yml run import incidents_to_s3.py
```

```shell
docker compose -f docker-compose.yml -f docker-compose.local.yml run import incidents_import.py
```

Note that the `--archive` directive prevents the script from moving each processed file to the `/archive` directory. 

## Deployment + CI

(TODO)

A github action is configured to build and push this ETL's image to the Docker hub whenever files in this directory are changed.

The ETL itself is deployed via [atd-airflow](https://github.com/cityofaustin/atd-airflow).

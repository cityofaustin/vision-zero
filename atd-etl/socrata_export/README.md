# Socrata Open Data Portal Export

This ETL downloads crash and people records from the VZ database and publishes them to the Open Data Portal, formerly known as Socrata.

## Datasets

Records are pushed to two socrata datasets. We have production and staging versions of each dataset. 

| env| record type |dataset id | url
|-|-|-|-
|staging|crashes|`3aut-fhzp` | ""
|staging|people|`v3x4-fjgm` | ""

- `SOCRATA_DATASET_CRASHES`
- `SOCRATA_DATASET_PEOPLE`

## Quick start

1. Save a copy of the `env_template` file as `.env`, and fill in the details.

2. Build and run the docker image. This will drop you into the docker image's shell:

```shell
$ docker compose run socrata_export
```

3. Run the export import script. This will download and publish crashes records, then people records.

```shell
# from the socrata_export container's shell
$ ./socrata_export.py
```

## CLI

Two CLI args are available, `--crashes` and `--people`, which can be used to process just one dataset instead of both.

```shell
$ ./socrata_export.py --crashes
```

## Column metadata helper

The script `_compare_column_metadata.py` can be used to compare the column definitions between two Open Data Portal datasets. It can be useful when you need to replicate changes between the staging and production datasets:

```shell
$ _compare_column_metadata.py
```

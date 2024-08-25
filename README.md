# Vision Zero Crash Data System

![Vision Zero Viewer](docs/images/vzv.png)

The Vision Zero Crash Data System is a suite of tools which support the City of Austin's [Vision Zero program](https://www.austintexas.gov/department/vision-zero), which seeks to reduce people hurt or killed by traffic crashes in Austin, TX.

The system has a primary focus on storing, editing, and analyzing traffic crash data, and comprises these core components:

- Vision Zero Database (VZD): A postgresql database which stores crash and crash-related records
- Vision Zero Editor (VZE): A web application which enables City staff to browse and edit crash data
- Vision Zero Viewer (VZV): A public dashboard which provides key metrics and insights about

This repository also holds integration scripts for consuming crash data from external sources, as well as publishing crash data to the City's Open Data Portal.


## Quick start

You need access to the production VZ database in order to develop locally. There is currently no option to run the Vision Zero stack based on seed data.


The helper script, `vision-zero`, makes it easy to spin up your local Vision Zero stack. See the [local development docs](docs/local_dev.md) for more details.

1. Create a new Python environment and install the packages in [requirements.txt](requirements.txt).

2. Save a copy of the [environment template (`env_template)](env_template) as `.env`, and populate your database read replica credentials.

```shell
RR_USERNAME=""
RR_PASSWORD=""
RR_HOSTNAME=""
RR_DATABASE=""
```

3. Start the DB

```shell
$ vision-zero replicate-db
```
This command will:

- Download a snapshot of the production database
- Store the file in `./atd-vzd/snapshots/visionzero-{date}-{with|without}-change-log.sql
- Drop local `atd_vz_data` database
- Create and repopulate the database from the snapshot

Note: the `-f / --filename` flag can be optionally used to point to a specific data dump `.sql` file to use to restore. The way the snapshots are dated means that one will only end up downloading one copy of the data per-day, both with and without change log data.

4. Start the Vision Zero Editor

```shell
$ vision-zero vze-up
```

## Learn more

## atd-cr3-api

This folder hosts our API that securely downloads a private file from S3. It is written in Python & Flask. and it is deployed in a Lambda function with Zappa.

[more info](./atd-cr3-api/README.md)

## atd-etl (Extract-Transform-Load)

Our current method for extracting data from the TxDOT C.R.I.S. data system uses a python library called [Splinter](https://splinter.readthedocs.io/en/latest/) to request, download and process data. It is deployed as a Docker container.

For step-by-step details on how to prepare your environment and how to execute this process, please refer to the documentation in the [atd-etl folder.](https://github.com/cityofaustin/atd-vz-data/tree/master/atd-etl)

[more info](./atd-etl/README.md)

## atd-vzd (Vision Zero Database)

VZD is our name for our Hasura GraphQL API server that connects to our Postgres RDS database instances.

[more info](./atd-vzd/README.md)

Production site: http://vzd.austinmobility.io/
Staging site: https://vzd-staging.austinmobility.io/

## atd-vze (Vision Zero Editor)

[more info](./atd-vze/README.md)

Production site: https://visionzero.austin.gov/editor/
Staging site: https://visionzero-staging.austinmobility.io/editor/

## atd-vzv (Vision Zero Viewer)

[more info](./atd-vzv/README.md)

Production site: https://visionzero.austin.gov/viewer/
Staging site: https://visionzero-staging.austinmobility.io/viewer/

## atd-toolbox

Collection of utilities related to maintaining data and other resources related to the Vision Zero Data projects.

## License

As a work of the City of Austin, this project is in the public domain within the United States.

Additionally, we waive copyright and related rights of the work worldwide through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).

# Vision Zero Crash Data System

This repository is home base for a suite of applications that help centralize and streamline the management of ATD's Vision Zero data. As a result of this project, staff will have a standardized interface for reviewing crash data, prioritizing intersection safety improvements, and communicating efforts to the public. Additionally, high quality VZ data will be publicly accessible online.

## atd-cr3-api

This folder hosts our API that securely downloads a private file from S3. It is written in Python & Flask. and it is deployed in a Lambda function with Zappa.

[more info](./atd-cr3-api/README.md)

## atd-cris-capybara

Our ETL process uses capybara to request, download and process data. The environment in which our capybara script runs is very specific to our needs, so we built a docker container which has all the requirements pre-built. There are also certain variables that are needed in order for capybara to run.

For step-by-step details on how to prepare your environment and how to execute this process, please refer to the documentation in the [atd-cris-capybara folder.](https://github.com/cityofaustin/atd-vz-data/tree/master/atd-cris-capybara)

[more info](./atd-cris-capybara/README.md)

## atd-vzd (Vision Zero Database)

VZD is our name for the Postgres database and Hasura GraphQL API server.

[more info](./atd-vzd/README.md)

## atd-vze (Vision Zero Editor)

VZE is our front end application built in React.js with CoreUI that allows a trusted group of internal users to edit and improve the data quality of our Vision Zero data. It consumes data from Hasura/VZD.

[more info](./atd-vze/README.md)

## atd-vzv (Vision Zero Viewer)

VZV is our public facing home for visualizations, maps, and dashboards that help make sense and aggregate trends in our Vision Zero Database

[more info](./atd-vzv/README.md)

## Getting Started

### Technology Stack

Technologies, libraries, and languages used for this project include:

- Hasura
- PostgreSQL
- React (Javascript)
- Core UI (HTML & CSS)
- Capybara (Ruby)
- Python

## License

As a work of the City of Austin, this project is in the public domain within the United States.

Additionally, we waive copyright and related rights of the work worldwide through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).

# Vision Zero Editor (VZE)

This project seeks to centralize and streamline the management of ATD's Vision Zero (VZ) data. As a result of this project, staff will have a standardized interface for reviewing crash data, prioritizing intersection safety improvements, and communicating efforts to the public. Additionally, high quality VZ data will be publicly accessible online.

Data is sourced from TxDOT's Crash Records Information System (CRIS) database. An editing interface provides tools for enriching data with more attributes and correct erronous or missing data.

For resources and updates, see the [Vision Zero Crash Data System](https://github.com/cityofaustin/atd-data-tech/issues/255) project index.

## Getting Started

### Technology Stack

Technologies, libraries, and languages used for this project include:

- Hasura
- PostgreSQL
- React (Javascript)
- Core UI (HTML & CSS)
- Capybara (Ruby)
- Python

### `atd-vze` Vision Zero Editor (VZE)

Install dependencies

`npm install`

Run development server

`npm start`

In development, this project uses [Prettier](https://prettier.io/) for code formatting which is set in .prettierrc. Visit link for installation or install the [extension for VSCode](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode).

### `atd-cris-capybara` ETL Script

Our ETL process uses capybara to request, download and process data. The environment in which our capybara script runs is very specific to our needs, so we built a docker container which has all the requirements pre-built. There are also certain variables that are needed in order for capybara to run.

For step-by-step details on how to prepare your environment and how to execute this process, please refer to the documentation in the [atd-cris-capybara folder.](https://github.com/cityofaustin/atd-vz-data/tree/master/atd-cris-capybara)

TODO

## License

As a work of the City of Austin, this project is in the public domain within the United States.

Additionally, we waive copyright and related rights of the work worldwide through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).

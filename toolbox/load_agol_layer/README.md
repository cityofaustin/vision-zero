# ArcGIS Online Layer Helper

This tool is used to load an ArcGIS Online (AGOL) layer into the Vision Zero database. It supports inserting, upserting, or replacing features in a database table with data sourced directly from AGOL.

## Quick start

1. Configure your envrionment by copying `env_template` as `local.env` and populating it accordingly.

```
HASURA_GRAPHQL_ENDPOINT=http://localhost:8084/v1/graphql
HASURA_GRAPHQL_ADMIN_SECRET=hasurapassword
AGOL_USERNAME=
AGOL_PASSWORD=
```

2. Start your local Vision Zero stack ([docs](https://github.com/cityofaustin/vision-zero?tab=readme-ov-file#quick-start))

3. Enable your Node environment

```shell
nvm use
```

4. Run `load_agol_layer` by passing your environment file and layer name

```shell
node --env-file=local.env src/load_agol_layer.js --layer signal_engineer_areas
```

## Configuration

### JS configuration

Each layer must be configured in the `LAYERS` object in [`settings.js`](/toolbox/load_agol_layer/src/settings.js). See the docstring in the settings file for specifics.

### DB configuration

- geometry type: use multipolygon
- unique ID
- what else?

## CLI

The `-l/--layer` arg is required to specify which layer will be processed. You can use the `--help` flag to see which layer options are available.

```shell
❯ node src/load_agol_layer.js --help
Usage: load_agol_layer [options]

Options:
  -l, --layer <name>  layer name (choices: "non_coa_roadways", "signal_engineer_areas")
  -h, --help          display help for comma
```

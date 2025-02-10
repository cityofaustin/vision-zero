# Run SQL

This tool enables us to run arbitrary SQL using the Hasura [schema API](https://hasura.io/docs/2.0/api-reference/schema-api/run-sql/).

## Configuration

1. Start your local Vision Zero cluster database + Hasura graphql API

2. Save a copy of the `env_template` file as `.env`, and fill in the graphql endpoint and admin secret. Note that the endpoint should end with `/v2/query` (see the [Hasura docs](https://hasura.io/docs/2.0/api-reference/schema-api/run-sql/) for more info).

3. Configure a python environment with `requests` installed. 

```
# see available commands
python run_sql.py -h
```

```
# refresh location crashes
python run_sql.py -c refresh_location_crashes
```

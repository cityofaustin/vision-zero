# Run SQL

This tool enables us to run arbitrary SQL using the Hasura [schema API](https://hasura.io/docs/2.0/api-reference/schema-api/run-sql/).

## Configuration

1. Start your local Vision Zero cluster database + Hasura graphql API

2. Save a copy of the `env_template` file as `.env`, and fill in the graphql endpoint and admin secret. Note that the endpoint should end with `/v2/query` (see the [Hasura docs](https://hasura.io/docs/2.0/api-reference/schema-api/run-sql/) for more info).

3. Buld the Docker image, which provides the Python dependencies

```shell
docker build -t atddocker/vz-run-sql:latest
```

4. With the image built, you can mount yor local copy of the script into the container and run it, like so:

```shell
docker run -it --rm -v $PWD:/app --env-file .env atddocker/vz-run-sql:latest  python run_sql.py -c refresh_location_crashes
```

5. To see all available sql commands that can be executed, use the `--help` flag

```shell
docker run -it --rm -v $PWD:/app --env-file .env atddocker/vz-run-sql:latest  python run_sql.py --help
```

## Deployment + CI

A github action is configured to build and push this ETL's image to the Docker hub whenever files in this directory are changed.

The ETL itself is deployed via [atd-airflow](https://github.com/cityofaustin/atd-airflow).

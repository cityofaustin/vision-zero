# CR3 metadata generator ETL

## Intent

This program is used to inspect the CR3s on file in S3 and to generate some metadata about them.
This metadata is then stored in the database and used by the various portions of the stack to determine
if and when a CR3 can be made available to users.

## Airflow DAG

This program is a python script which is bundled up into a docker image and to be run by [Airflow](https://github.com/cityofaustin/atd-airflow/blob/production/dags/vz_populate_cr3_metadata.py).

## Local use

This program also comes with a docker compose stack. To run it locally, you can do something along these lines:

```bash
cp env_template env;

# Edit the env file to include the necessary environment variables

# The following command will drop you in a bash shell in the metadata container.
docker compose run metadata;

# some example invocations
./populate_cr3_file_metadata.py -h; # see the options
./populate_cr3_file_metadata.py -a; # process the entire queue, quietly, with a progress bar
./populate_cr3_file_metadata.py -t 10 -s 100 -v; # process the first 100 CR3s in the queue, verbosely, using 10 threads.
```

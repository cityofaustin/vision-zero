# CRIS Import ETL

These scripts manage the processing and importing of TxDOT CRIS data into the Vision Zero database.

## Local development / testing


### 
1. Start your local Vision Zero cluster (database + Hasura).

2. Get at least one CRIS extract ZIP file and move it to the `./extracts` directory. 

3. Save a copy of the `env_template` file as `.env`, and fill in the details. 

4. Use `docker compose` to build and run the docker image. This will drop you into the docker image's shell:

```shell
$ docker compose build
$ docker compose run cris_import
```

5. Run the main script. This will unzip the extract, load the CSV crash records into the database, and process CR3s (but upload them nowhere)

```shell
# from the cris_import container's shell
$ ./cris_import.py
```

## CRIS CR3 .pdf Downloads

### Invocation

After creating an .env file using the variables listed in the env_template file, you can run this script with:
```
$ docker compose run -it cr3_download python cr3_download.py
```

If you are developing, you may find that you need to run and build:
```
$ docker compose run --build -it cr3_download python cr3_download.py
```

In production, they will be run from a DAG which handles starting the containers with
the needed environment and other parameters.

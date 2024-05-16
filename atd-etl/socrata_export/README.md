## Vision Zero Socrata Export

### Invocation

After creating an .env file using the variables listed in the env_template file, you can run this script with:
```
$ docker compose run -it socrata_export python socrata_export.py
```

If you are developing, you may find that you need to run and build:
```
$ docker compose run --build -it socrata_export python socrata_export.py
```

In production, they will be run from a DAG which handles starting the containers with
the needed environment and other parameters.

## Import scripts for AFD and EMS Daily Data Exports


### Invocation

For local development, you may find that the `docker-compose.yml` eases the work
of having to collect the correct arguments to the docker invocation. After creating
a .env file, you can run these scripts with:

```
$ docker compose run import afd
$ docker compose run import ems
```

In production, they will be run from a DAG which handles starting the containers with
the needed environment and other parameters.

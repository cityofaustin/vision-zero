## Local Development

Use the [`vision-zero`](./vision-zero) helper script to replicate and run the Vision Zero database and graphQL API locally.

See the repo [README](/README.md) for quick start instructions for using this tool.

The `vision-zero` program is a light wrapper around the functionality provided by `docker compose`. By inspecting the `docker-compose.yml` file, you can find the definitions of the services in the stack, and you can use the `docker compose` command to turn up, stop, and attach terminals to the running containers and execute on-off commands. This can provide you access to containers to install nodejs libraries, use postgres' supporting programs (`psql`, `pg_dump`) and other lower level utilities.

### `vision-zero` command auto-completion

The `vision-zero` application is able to generate auto-completion scripts via the `shtab` python library. For example, `zsh` users may use the following to enable this feature. `bash` and `csh` users will have similar steps to follow particular to their shell of choice.

```
mkdir ~/.zsh_completion_functions;
chmod g-w,o-w ~/.zsh_completion_functions;
cd $WHEREVER_YOU_HAVE_VZ_CHECKED_OUT;
source ./venv/bin/active;
./vision-zero -s zsh | tee ~/.zsh_completion_functions/_vision-zero
```

### Examples of `vision-zero` commands

#### `vision-zero build`

Rebuild the stack's images based on the Dockerfiles found in the repository. They are built with the `--no-cache` flag which will make the build process slower, but avoid any stale image layers that have inadvertently cached out-of-date apt resource lists.

#### `vision-zero db-up` & `vision-zero db-down`

Start and stop the postgres database

#### `vision-zero graphql-engine-up` & `vision-zero graphql-engine-down`

Start and stop the Hasura graphql-engine software as well as the database

### `vision-zero api-up` & `vision-zero api-down`

Start and stop the Vision Zero CR3 / User API

### `vision-zero up` & `vision-zero down`

Start and stop the DB, `graphql-engine`, and the API at once

#### `vision-zero psql`

Start a `psql` postgreSQL client connected to your local database

#### `vision-zero tools-shell`

Start a `bash` shell on a machine with supporting tooling

#### `vision-zero stop`

Stop the stack

#### `vision-zero replicate`

- Download a snapshot of the production database
- Store the file in `./database/snapshots/visionzero-{date}-{with|without}-change-log.sql`
- Drop local `vision_zero` database
- Create and repopulate the database from the snapshot

Note: the `-c / --include-change-log-data` flag can be used to opt to include the data of past change log events. The schema is created either way.
Note: the `-f / --filename` flag can be optionally used to point to a specific data dump .sql file to use to restore.

The way the snapshots are dated means that one will only end up downloading one copy of the data per-day, both in the with and without change log data.


#### `vision-zero dump-local-db`

- pg_dump the current local database
- Stores the file in `./database/dumps/visionzero-{date}-{time}.sql

#### `vision-zero remove-snapshots`

Remove snapshot files. This can be done to save space and clean up old snapshots, but it's also useful to cause a new copy of the day's data to be downloaded if an upstream change is made.

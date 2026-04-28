# DB Benchmark Helper

This tool runs `benchmark_db.py` in Docker and executes the SQL in `timing_query.sql`.

## Quick start

From `toolbox/db_benchmark/`:

```shell
docker compose run --rm benchmark-db
```

## Targeting a specific Postgres instance

The benchmark container reads standard `PG*` environment variables. You can override them at runtime:

```shell
PGHOST=host.docker.internal PGPORT=5431 PGDATABASE=vision_zero PGUSER=visionzero PGPASSWORD=visionzero docker compose run --rm benchmark-db
```

## Tuning Postgres for local benchmarking

The main local Postgres container (`docker-compose.yml`) supports these tunables through `.env`:

- `PG_MAINTENANCE_WORK_MEM`
- `PG_MAX_WAL_SIZE`
- `PG_SHARED_BUFFERS`
- `PG_WORK_MEM`
- `PG_EFFECTIVE_CACHE_SIZE`
- `PG_CHECKPOINT_COMPLETION_TARGET`

After editing `.env`, restart the DB:

```shell
./vision-zero db-down
./vision-zero db-up
```

Then run the benchmark against it (`PGHOST=host.docker.internal`, `PGPORT=5431`).

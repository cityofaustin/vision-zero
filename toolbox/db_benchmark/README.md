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
- `PG_RANDOM_PAGE_COST`
- `PG_EFFECTIVE_IO_CONCURRENCY`
- `PG_MAX_CONNECTIONS`
- `PG_DEFAULT_STATISTICS_TARGET`
- `PG_JIT`
- `PG_WAL_COMPRESSION`

After editing `.env`, restart the DB:

```shell
./vision-zero db-down
./vision-zero db-up
```

Then run the benchmark against it (`PGHOST=host.docker.internal`, `PGPORT=5431`).

To verify the effective settings in Postgres:

```sql
SHOW maintenance_work_mem;
SHOW max_wal_size;
SHOW shared_buffers;
SHOW work_mem;
SHOW effective_cache_size;
SHOW checkpoint_completion_target;
SHOW random_page_cost;
SHOW effective_io_concurrency;
SHOW max_connections;
SHOW default_statistics_target;
SHOW jit;
SHOW wal_compression;
```

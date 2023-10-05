

docker run \
-e PGHOST=host.docker.internal -e PGPORT=5433 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_staging \
-it postgres:latest pg_dump | \
docker run \
-e PGHOST=host.docker.internal -e PGPORT=5434 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_staging \
-i postgres:latest psql -v ON_ERROR_STOP=1



docker run \
-e PGHOST=vision-zero.cgq9skxulxcb.us-east-1.rds.amazonaws.com -e PGPORT=5432 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data \
-it --log-driver none postgres:latest pg_dump | pv > production.sql


docker run \
-e PGHOST=vision-zero.cgq9skxulxcb.us-east-1.rds.amazonaws.com -e PGPORT=5432 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_staging \
-it postgres:latest pg_dump | pv > staging.sql




cat staging.sql | \
docker run \
-e PGHOST=vision-zero-aurora-instance-1.cgq9skxulxcb.us-east-1.rds.amazonaws.com -e PGPORT=5432 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_staging \
-i postgres:latest psql -v ON_ERROR_STOP=1






echo "drop database if exists atd_vz_data_staging with (force);" | \
docker run \
-e PGHOST=vision-zero-aurora-instance-1.cgq9skxulxcb.us-east-1.rds.amazonaws.com -e PGPORT=5432 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=postgres \
-i postgres:latest psql -v ON_ERROR_STOP=1

echo "create database atd_vz_data_staging;" | \
docker run \
-e PGHOST=vision-zero-aurora-instance-1.cgq9skxulxcb.us-east-1.rds.amazonaws.com -e PGPORT=5432 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=postgres \
-i postgres:latest psql -v ON_ERROR_STOP=1

#  --schema-only
docker run \
-e PGHOST=vision-zero.cgq9skxulxcb.us-east-1.rds.amazonaws.com -e PGPORT=5432 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_staging \
-it --log-driver none postgres:latest pg_dump | \
perl -pe 's/^(SELECT pg_catalog\.set_config)/-- $1/g' | \
perl -pe 's/^(.*haighta.*)/-- $1/g' | \
perl -pe 's/^(.*(pgis_geometry_union_finalfn|st_clusterkmeans).*)/-- $1/g' | \
docker run \
-e PGHOST=vision-zero-aurora-instance-1.cgq9skxulxcb.us-east-1.rds.amazonaws.com -e PGPORT=5432 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_staging \
-i --log-driver none postgres:latest psql -v ON_ERROR_STOP=1










docker run \
-e PGHOST=vision-zero.cgq9skxulxcb.us-east-1.rds.amazonaws.com -e PGPORT=5432 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_staging \
-it --log-driver none postgres:latest pg_dump | \
perl -pe 's/^(SELECT pg_catalog\.set_config)/-- $1/g' | \
perl -pe 's/^(.*haighta.*)/-- $1/g' | \
perl -pe 's/^(.*(pgis_geometry_union_finalfn|st_clusterkmeans).*)/-- $1/g' | pv > staging.sql

echo "drop database if exists atd_vz_data_staging with (force);" | \
docker run \
-e PGHOST=vision-zero-aurora-instance-1.cgq9skxulxcb.us-east-1.rds.amazonaws.com -e PGPORT=5432 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=postgres \
-i postgres:latest psql -v ON_ERROR_STOP=1

echo "create database atd_vz_data_staging;" | \
docker run \
-e PGHOST=vision-zero-aurora-instance-1.cgq9skxulxcb.us-east-1.rds.amazonaws.com -e PGPORT=5432 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=postgres \
-i postgres:latest psql -v ON_ERROR_STOP=1

cat staging.sql | \
docker run \
-e PGHOST=vision-zero-aurora-instance-1.cgq9skxulxcb.us-east-1.rds.amazonaws.com -e PGPORT=5432 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_staging \
-i --log-driver none postgres:latest psql -v ON_ERROR_STOP=1


# final staging copy command
docker run \
-e PGHOST=vision-zero.cgq9skxulxcb.us-east-1.rds.amazonaws.com -e PGPORT=5432 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_staging \
-it --log-driver none postgres:latest pg_dump | \
perl -pe 's/^(SELECT pg_catalog\.set_config)/-- $1/g' | \
perl -pe 's/^(.*haighta.*)/-- $1/g' | \
perl -pe 's/^(.*(pgis_geometry_union_finalfn|st_clusterkmeans).*)/-- $1/g' |
docker run \
-e PGHOST=vision-zero-aurora-instance-1.cgq9skxulxcb.us-east-1.rds.amazonaws.com -e PGPORT=5432 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_staging \
-i --log-driver none postgres:latest psql -v ON_ERROR_STOP=1


docker run \
-e PGHOST=vision-zero.cgq9skxulxcb.us-east-1.rds.amazonaws.com -e PGPORT=5432 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data \
-it --log-driver none postgres:latest pg_dump | \
perl -pe 's/^(SELECT pg_catalog\.set_config)/-- $1/g' | \
perl -pe 's/^(.*haighta.*)/-- $1/g' | \
perl -pe 's/^(.*(pgis_geometry_union_finalfn|st_clusterkmeans).*)/-- $1/g' | pv > production.sql

echo "drop database if exists atd_vz_data with (force);" | \
docker run \
-e PGHOST=vision-zero-aurora-instance-1.cgq9skxulxcb.us-east-1.rds.amazonaws.com -e PGPORT=5432 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=postgres \
-i postgres:latest psql -v ON_ERROR_STOP=1

echo "create database atd_vz_data;" | \
docker run \
-e PGHOST=vision-zero-aurora-instance-1.cgq9skxulxcb.us-east-1.rds.amazonaws.com -e PGPORT=5432 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=postgres \
-i postgres:latest psql -v ON_ERROR_STOP=1

cat production.sql | \
docker run \
-e PGHOST=vision-zero-aurora-instance-1.cgq9skxulxcb.us-east-1.rds.amazonaws.com -e PGPORT=5432 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data \
-i --log-driver none postgres:latest psql -v ON_ERROR_STOP=1



docker run \
-e PGHOST=vision-zero.cgq9skxulxcb.us-east-1.rds.amazonaws.com -e PGPORT=5432 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data \
-it --log-driver none postgres:latest pg_dump | \
perl -pe 's/^(SELECT pg_catalog\.set_config)/-- $1/g' | \
perl -pe 's/^(.*haighta.*)/-- $1/g' | \
perl -pe 's/^(.*(pgis_geometry_union_finalfn|st_clusterkmeans).*)/-- $1/g' | \
docker run \
-e PGHOST=vision-zero-aurora-instance-1.cgq9skxulxcb.us-east-1.rds.amazonaws.com -e PGPORT=5432 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data \
-i --log-driver none postgres:latest psql -v ON_ERROR_STOP=1
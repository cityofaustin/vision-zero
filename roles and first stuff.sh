# template to connect to old production
docker run \
-e PGHOST=host.docker.internal -e PGPORT=5433 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data \
-it postgres:latest psql 







echo "CREATE ROLE herefordf LOGIN PASSWORD 'sFNczF9PTG9MRLpu2NzWMMFAe6KUeyNhPfFfrXKE';" | \
docker run \
-e PGHOST=host.docker.internal -e PGPORT=5434 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_test \
-i postgres:latest psql -v ON_ERROR_STOP=1

echo "CREATE ROLE berryc LOGIN PASSWORD 'WNMokvy9miDeyZXaVWXyfiHNfYXZDRFAKb8kQQhw';" | \
docker run \
-e PGHOST=host.docker.internal -e PGPORT=5434 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_test \
-i postgres:latest psql -v ON_ERROR_STOP=1

echo "CREATE ROLE claryj LOGIN PASSWORD 'r6Li6chNriVuDse97eg9f2rQdPYgVnDPWQyKTDyf';" | \
docker run \
-e PGHOST=host.docker.internal -e PGPORT=5434 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_test \
-i postgres:latest psql -v ON_ERROR_STOP=1

echo "CREATE ROLE dilleym LOGIN PASSWORD '6ZBDYArdtKtAcTPFsw2BjpD6ELercajEyVNEmBvD';" | \
docker run \
-e PGHOST=host.docker.internal -e PGPORT=5434 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_test \
-i postgres:latest psql -v ON_ERROR_STOP=1

echo "CREATE ROLE eichelmannr LOGIN PASSWORD 'zwgy3YhotRyzxv2ydGo2xWHZLdVN4HXifsZtAdQi';" | \
docker run \
-e PGHOST=host.docker.internal -e PGPORT=5434 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_test \
-i postgres:latest psql -v ON_ERROR_STOP=1

echo "CREATE ROLE whitsont LOGIN PASSWORD 'NizPaDTMU9FxipzC9mYayq8nYKhVC8d8xafnngHV';" | \
docker run \
-e PGHOST=host.docker.internal -e PGPORT=5434 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_test \
-i postgres:latest psql -v ON_ERROR_STOP=1

echo "CREATE ROLE mcdonnellp LOGIN PASSWORD 'Ggnby6vNUPWqgs8EET68m3zyCDaBb2hvxJzxWD24';" | \
docker run \
-e PGHOST=host.docker.internal -e PGPORT=5434 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_test \
-i postgres:latest psql -v ON_ERROR_STOP=1

echo "CREATE ROLE apostolx LOGIN PASSWORD 'ZtHnAD8XWqGg8rMEP7U9jC8oHp8yX4JdNU7QwjMT';" | \
docker run \
-e PGHOST=host.docker.internal -e PGPORT=5434 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_test \
-i postgres:latest psql -v ON_ERROR_STOP=1

echo "CREATE ROLE henryc LOGIN PASSWORD 'YbVTfnrwLWan8UbX8oddyNVqZiRDteCjwa7RBtYL';" | \
docker run \
-e PGHOST=host.docker.internal -e PGPORT=5434 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_test \
-i postgres:latest psql -v ON_ERROR_STOP=1

echo "CREATE ROLE meyerj LOGIN PASSWORD '4W69iCuoX4NBcQ2ZmPMt';" | \
docker run \
-e PGHOST=host.docker.internal -e PGPORT=5434 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_test \
-i postgres:latest psql -v ON_ERROR_STOP=1

echo "CREATE ROLE vze LOGIN PASSWORD 'eUKoB7VXqaJsizmAUp4xqEE2Nk9TaB4d4FQtJjcL';" | \
docker run \
-e PGHOST=host.docker.internal -e PGPORT=5434 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_test \
-i postgres:latest psql -v ON_ERROR_STOP=1

echo "CREATE ROLE staff;" | \
docker run \
-e PGHOST=host.docker.internal -e PGPORT=5434 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_test \
-i postgres:latest psql -v ON_ERROR_STOP=1



echo "drop database if exists atd_vz_data_staging with (force);" | \
docker run \
-e PGHOST=host.docker.internal -e PGPORT=5434 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=postgres \
-i postgres:latest psql -v ON_ERROR_STOP=1

echo "create database atd_vz_data_staging;" | \
docker run \
-e PGHOST=host.docker.internal -e PGPORT=5434 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=postgres \
-i postgres:latest psql -v ON_ERROR_STOP=1



docker run \
-e PGHOST=host.docker.internal -e PGPORT=5433 -e PGUSER=postgres \
-e PGPASSWORD=yVdnBL3jPq99AQaX3HCvYPRYkqXGYbnguB642XgP \
-e PGDATABASE=atd_vz_data_staging \
-it postgres:latest pg_dump | pv > staging.sql

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


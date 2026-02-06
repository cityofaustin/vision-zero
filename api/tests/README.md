# Tests

Follow this readme to run the API tests. Be sure to write additional tests as you update the API.

## Run tests

### Start your local stack

From the root of the repo, start the VZ stack

```shell
./vision-zero local-stack-up
```

From the `./editor` directory, start the VZE:

```shell
npm run dev
```

### Set up test env

The tests require read-only, editor, and admin test user credentials. The tests also require Auth0 app metadata so that we can retrieve JWTs during the tests.

In the `./api` directory, create a file called `.env.test` and populate each value listed below.

```shell
# .env.test
# 1password: Vision Zero Editor (VZE) Test User: Read-only viewer
READ_ONLY_USER_EMAIL=
READ_ONLY_USER_PASSWORD=
# 1password: Vision Zero Editor (VZE) Test User: Editor
EDITOR_USER_EMAIL=
EDITOR_USER_PASSWORD=
# 1password: Vision Zero Editor (VZE) Test User: VZ Admin
ADMIN_USER_EMAIL=
ADMIN_USER_PASSWORD=
# Auth0 staging app metadata
AUTH0_DOMAIN="atd-datatech.auth0.com"
CLIENT_ID=2qbqz2sf8L9idBOwn0d5YA9efNgQbL7c
AUTH0_AUDIENCE=2qbqz2sf8L9idBOwn0d5YA9efNgQbL7c
```

### Run the tests

From the `./api` directory, use the docker compose to run the tests:

```shell
docker compose -f docker-compose-tests.yaml run --rm cr3-user-api-test
```

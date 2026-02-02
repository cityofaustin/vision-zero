# Tests

The API currently has near 100% test coverage. Follow this readme to run the tests.

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

TODO: update env template and docs here.

In the `./api` directory, create a file called `.env.test` and save your bearer token to `TEST_AUTH_TOKEN`.

```shell
# .env.test
TEST_AUTH_TOKEN="Bearer ...."
```

This token will expire in 5 minutes. You'll need to grab a fresh token your token expires. You'll know your token is invalid if you hit a `401` error.

### Run the tests

From the `./api` directory, use the docker compose to run the tests:

```shell
docker compose -f docker-compose-tests.yaml run --rm cr3-user-api-test
```

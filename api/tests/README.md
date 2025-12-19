# Tests

The API currently has test coverage for the `/images/person/<person_id>` endpoint. Follow this readme to run the tests.

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

Use the VZE to login to the app, and copy your JWT from a network request to the API. These are typically listed under the name `graphql` in your dev console.

In the `./api` directory, create a file called `.env.test` and save your bearer token to `TEST_AUTH_TOKEN`.

```shell
# .env.test
TEST_AUTH_TOKEN="Bearer ...."
```

### Run the tests

From the root of the repo, use docker compose to run the tests:

```
docker compose run --rm cr3-user-api-test
```

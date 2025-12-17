# VZ User & CR3 API

This API provides authenticated access to our CR3 crash report file repository in AWS S3 as well as Auth0 user management operations. It enables users to download CR3 PDFs from the Vision Zero Editor, and it enables admin users to create, modify, and delete VZE user accounts.

## Deployment

The API consists of a flask app which is bundled into a docker image and pushed to Docker Hub. It is deployed on AWS ECS as a service inside the VZ clusters. There is a `:production` and `:latest` version of the image, and these are built by CI on merger to the `production` and `main` branches respectively.

Our endpoints can be found at:

Staging: https://vision-zero-cr3-user-api-staging.austinmobility.io/

Production: https://vision-zero-cr3-user-api.austinmobility.io/

These flask apps are deployed as long-running tasks in ECS and are reverse proxy'd out to the internet by an AWS API gateway via a namespace / VPC link configuration. Specific deployment instructions for the COA deployment are contained in our internal documentation repositories.

## Configuration

The API requires certain environment variables to be set. Copy the `.env.example` file in the `api` directory to `.env` and fill in the values.

## Local usage

Copy the `.env.example` file in this directory to `.env`. To fill in the missing secret values, use the `Vision Zero (VZ) User & CR3 API Secrets`....

```
NEXT_PUBLIC_CR3_API_DOMAIN=http://localhost:8085
```

You can start the API using either the project wide `docker compose` file with `docker compose up cr3-user-api` or if you prefer, you can use the `docker compose` stack that is concerned only with part of the stack as found in the `api` directory. Use whichever is best for your development needs.

Both docker compose files enable local development by:

- mounting your local `/api` directory into the container
- use the `--debug` command so that the web server restarts when it detects code changes

Additionally, you can use the `vision-zero` orchestration tool to `vision-zero api-up` and `vision-zero api-down` to start and stop the API.

## Secrets

Please see the entry "Vision Zero (VZ) User & CR3 API Secrets" in the developers vault in 1PW for information about the secret values.

## Testing the API / Is this thing on?

Where ever you have the API running, you can hit it at the root of the domain `/` and you should get a health message that includes both the current time, but also the age of the process serving the API. This is helpful in confirming a restart has occurred, or that the API is up and running.

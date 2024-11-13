# VZ User & CR3 API

## Big Picture

The API consists of a flask app which is bundled into a docker image and pushed to Docker Hub. It is deployed on AWS ECS as a service inside the VZ clusters. There is a `:production` and `:staging` version of the image, and these are built by CI on merger to the `production` and `main` branches respectively.

## Local usage

You can start the API using either the project wide `docker compose` file with `docker compose up cr3-user-api` or if you prefer, you can use the `docker compose` stack that is concerned only with part of the stack as found in the `api` directory. Use whichever is best for your development needs. Additionally, you can use the `vision-zero` orchestration tool to `vision-zero api-up` and `vision-zero api-down` to start and stop the API.

## Configuration

The API requires certain environment variables to be set. Copy the `.env.example` file in the `api` directory to `.env` and fill in the values.

## Testing the API / Is this thing on?

Where ever you have the API running, you can hit it at the root of the domain `/` and you should get a health message that includes both the current time, but also the age of the process serving the API. This is helpful in confirming a restart has occurred, or that the API is up and running.


# Vision Zero Editor (VZE)

The Vision Zero Editor (VZE) enables City of Austin staff to browse and edit traffic crash data. It the central application that supports the City's [Vision Zero program](https://www.austintexas.gov/department/vision-zero), and related safety efforts carried out by the Transportation & Public Works Department.


- Production: https://visionzero.austin.gov/editor
- Staging: https://visionzero-staging.austinmobility.io/editor


## Quick start


1. [Vision Zero Database (VZD)](./database/README.md)

2. Use the `env_template` to configure the local environment variables

```shell
# run this cmd and then edit .env.local as needed
cp -n env_template .env.local
```

1. Activate your `node` environment (`v20` is required):

```shell
nvm use
```

4. Install node packages

```
npm install
```

5. Start the development server

```shell
npm run dev
```

6. Open [http://localhost:3002](http://localhost:3002) with your browser to see the result.

## Deployment


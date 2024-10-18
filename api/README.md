# Auth0 + Python + Flask API

This is an API that securely downloads a private file from S3. It is written in Python & Flask. and it is deployed in a Lambda function with Zappa.

This is an API based on a [seed project](https://github.com/auth0-samples/auth0-python-web-app/tree/master/01-Login) from Auth0. For details, you can find more documentation [here](https://auth0.com/docs/quickstart/backend/python) to better understand this API.


# Running the example

First, be sure to set up a virtual environment:

```bash
virtualenv venv
source venv/bin/activate
``` 

In order to run the example you need to have `python` and `pip` installed.

You also need to set up a series of environment variables, including your Auth0 Domain and the CLIENT_ID (as audience id) as environment variables with the following names respectively: `AUTH0_DOMAIN` and `CLIENT_ID`, as well as AWS credentials and additional bucket settings.

Option A) Rename `.env.example` file to `.env` and fill in the blanks.

```bash
# .env.example
AUTH0_DOMAIN="atd-datatech.auth0.com"
CLIENT_ID="2qbqz2sf8L9idBOwn0d5YA9efNgQbL7c"
...
```

Option B) Export directly in bash:


```bash
export AUTH0_DOMAIN=atd-datatech.auth0.com
export CLIENT_ID=2qbqz2sf8L9idBOwn0d5YA9efNgQbL7c
...
```


Once you've set those 2 environment variables:

1. Install the needed dependencies with `pip install -r requirements.txt`
2. Start the server with `python server.py`
3. Try calling [http://localhost:3010/download/<crash_id>](http://localhost:3010/download/)

# Testing the API

You can then try to do a GET to [http://localhost:3010/download](http://localhost:3010/download) which will
throw an error if you don't send an access token signed with RS256 with the appropriate issuer and audience in the
Authorization header. 

# Deploy

The script uses the Zappa framework to deploy to AWS, please refer to the zappa documentation for specific details.

There is already a `zappa_settings.json` file that determines the configuration of the deployment and the necessary environment variables.

To deploy and or update:

```bash
# First make sure you have sourced your environment:
$ source venv/bin/activate

# Then, to deploy for the first time:
$ zappa deploy staging
$ zappa deploy production

# Or to update:
$ zappa update staging
$ zappa update production
```

You will be provided with a lambda endpoint if successful.
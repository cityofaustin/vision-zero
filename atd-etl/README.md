# ATD - ETL

This is an ETL tool that automates the making of requests, downloads and processing of crash data from the C.R.I.S. website.

It utilizes Docker, Python and the [Splinter](https://splinter.readthedocs.io/en/latest/) framework running on `python:3-alpine3.8` to emulate browser behavior. It requires setting up environment variables on your system to run, please refer to the steps below to get started.

### Why using docker?

This application runs Splinter which is a wrapper for headless browsers (Firefox, Chrome, Selenium, etc). This specific application runs using headless chrome with chromedriver, and using docker we can package all the dependencies needed to run the application without many installation steps.

In short, Docker allows us to have a fully built container with everything already built, installed and ready to run. 

### Getting Started

#### 1. Get or Build the image:

Depending on your broadband speed, you may want to avoid building the image, it can take a while to build. Instead it is suggested you download it via docker-pull.

Method A (Pull pre-built image, it's large):

```bash
docker pull atddocker/atd-vz-etl
```

Method B (Build image, it can take a minute or two)

```bash
docker build -f Dockerfile -t atddocker/atd-vz-etl .
```

Be sure to have the source code cloned in your computer before you can build the Dockerfile.

#### 2. Edit your environment variables

Edit both `etl.production.env` and `etl.staging.env` and insert the proper values for each environment variable.  The ETL process relies on a few variables to access API services and other integrations, to find these, you can go to 1password and look for `Vision Zero ETL` to find both files. Make sure you change permissions to make sure only you can see these files: `chmod 600 ./etl.staging.env`

Once you edit your changes, save and run the image.

#### 3. We run the image:

Option 1:

Set up an environment variable `ATD_CRIS_CONFIG` with the location to your env-file and run:


1. Run `source runetl.sh` to load the function you will need to run the ETL.
2. Run the helper like this: `runetl [ENVIRONMENT] [APP FILE]`

The environment is optional, if not provided it will assume staging.

Examples:

```bash
$ runetl staging app/process_cris_cr3.py
$ runetl production app/process_cris_cr3.py

# The environment is optional, but if not provided it will deafult to staging.
$ runetl app/process_cris_cr3.py

# the commands above run as staging

```


Option 2:

Run with Docker:

```bash
docker run -it --rm -v $(pwd)/app:/app -v $(pwd)/data:/data \
--env-file ~/location/to/env-file.env \ 
atddocker/atd-vz-etl \
sh -c "python /app/process_cris_cr3.py"
```

Option 3:

Run without env-file, but providing the required variables through the console:

```bash
docker run -it --rm -v $(pwd)/app:/app -v $(pwd)/data:/data \
--env ATD_CRIS_USERNAME=$ATD_CRIS_USERNAME \
--env ATD_CRIS_PASSWORD=$ATD_CRIS_PASSWORD \
atddocker/atd-vz-etl python /app/process_cris_cr3.py
```

## ETL Scripts

As of this moment, the ETL container should be able to run these scripts:

- `app/process_cris_cr3.py` - This script will log in to the CRIS website using the splinter python library, it will download N number of pdf files, upload such pdf files to S3, update the records through Hasura, and finally delete the PDF from the container.
- `app/process_cris_request.py` - This script will log in to the CRIS website and request a new extract.
- `app/process_cris_request_download.py` - This script will parse the email, download the ZIP file, and extract its protected contents.
- `app/process_hasura_import.py` - This script will import the already extracted CSV files and insert to the database via Hasura.
- `app/process_hasura_geocode.py` - This script will look for records in the database through Hasura that do not have a Lat/Long, it will try to find the coordinates if enough information is provided.
- `app/process_hasura_locations.py` - This script will find crashes that do not have a location assigned. If no location is found it leaves the record intact, and moves unto the next records.
- `app/process_hasura_cr3heal.py` - This script will make sure the records in Hasura that are marked to have a CR3 actually have a PDF in S3. If the file is not found in S3, then it will unmark the file.
- `app/process_socrata_export.py` - This script will export data unto the Socrata.

As of this first iteration, the docuentation is not fully fleshed out. This is a living document that needs to be updated as new features are added and implemented. 
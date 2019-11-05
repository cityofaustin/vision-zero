# Current State - Read Me

** IMPORTANT **

Currently the ETL processes is undergoing a review. We are re-evaluating Capybara a as a viable tool to run our ETL processes.

In capybara we are currently experiencing some challenges, including:

- Non-uniform Code and Frameworks, it is confusing to have both ruby and python in the same container.
- The capybara container takes up a lot of memory, up to 3gb.


We are evaluating other frameworks in python that could replace capybara, such as splinter, python-selenium, or just plain python.

# atd-cris-capybara

### What is it

This is an ETL tool that automates the making of requests, downloads and processing of crash data from the C.R.I.S. website. It utilizes Capybara with Ruby to emulate browser behavior, Python, and Docker. It requires setting up environment variables on your system to run, these can be fund in the `./scripts/run.sh` file.

### Why using docker?

This application runs on Capybara, and our app is specifically configured to run on WebKit drivers. There are other drivers available, such as selenium, native ruby drivers, firefox, etc.

WebKit drivers are built on top of Qt5WebKit for headless browsing, which in turn has other dependencies tht need to be compiled.

Docker allows us to have a fully built container with everything already built and installed. 

### Usage

#### 1. Get the image:

Depending on your broadband speed, you may want to avoid building the image, it can take a while to build. Instead it is suggested you download it via docker-pull.

Method A (Pull pre-built image, it's large):

```bash
docker pull atddocker/atd-cris-capybara
```

Method B (Build image, it takes very long)

```bash
docker build -f Dockerfile -t atddocker/atd-cris-capybara .
```

Be sure to have the source code cloned in your computer before you can build the Dockerfile.

#### 2. Set up the `config.env` file

The ETL process relies on a few variables to access API services.
This file can be found in the atd-data production/tests servers with protected access.
(Only the service user account should have read-access, ie. root or any other service user name)

Once you create this file, be sure to restrict access to it, example:  `chmod 400 config.env`
which should give read-only access to the current session user.  

These are the environment variables it needs:

```bash
# First your AWS Access Credentials
AWS_ACCESS_KEY_ID=... 
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...

# PostgreSQL Access
ATD_CRIS_POSTGRES_HOST=...
ATD_CRIS_POSTGRES_DB=...
ATD_CRIS_POSTGRES_USER=...
ATD_CRIS_POSTGRES_PASS=...
ATD_CRIS_POSTGRES_CERT=... (the path to the pem file, /app/rds-combined-ca-bundle.pem by default)

# SQL Tables 
ATD_CRIS_PROSTGRES_TABLE_CRASHES=...
ATD_CRIS_PROSTGRES_TABLE_CHARGES=...
ATD_CRIS_PROSTGRES_TABLE_PEOPLE=...
ATD_CRIS_PROSTGRES_TABLE_UNITS=...

# Knack Access
ATD_KNACK_APP_ID=...
ATD_KNACK_API_KEY=...

# CRIS access
ATD_CRIS_USERNAME=...
ATD_CRIS_PASSWORD=...

# GeoCode access
ATD_CRIS_HERE_APP_ID=...
ATD_CRIS_HERE_APP_CODE=...
```

Alternatively, you can export each one of those variables to your console via a custom *.sh
file and source the file. For example, you would create a `custom_variables.sh` file, and then
source it: `source custom_variables.sh`. Once sources you would run the command 

The last thing you will need, is 


#### 3. We run the image:

Option 1:

Set up an environment variable `ATD_CRIS_CONFIG` with the location to your env-file and run:

```bash
./scripts/run.sh
```

Option 2:

Run with Docker:

```bash
docker run -it --rm \
--env-file ~/location/to/env-file.env
atddocker/atd-cris-capybara \
sh -c "xvfb-run --server-args=\"-screen 0 1024x768x24\" ruby main.rb"
```

Option 3:

Run without env-file, but providing the required variables through the console:

```bash
docker run -it --rm \
--env ATD_CRIS_USERNAME=$ATD_CRIS_USERNAME \
--env ATD_CRIS_PASSWORD=$ATD_CRIS_PASSWORD \
--env ATD_CRIS_REPORT_DATE_START="01/01/2019" \
--env ATD_CRIS_REPORT_DATE_END=`date +%m/%d/%Y` \
atddocker/atd-cris-capybara bash
```


## Development

It has been my experience when trying to troubleshoot or develop one line at the time that it is best to use ruby's IRB.

First launch the contianer with bash & mounting the app folder as a volume, passing the required environment variables.

```bash
docker run -it --rm -v $(pwd)/app:/app \
--env ATD_CRIS_USERNAME=$ATD_CRIS_USERNAME \
--env ATD_CRIS_PASSWORD=$ATD_CRIS_PASSWORD \
--env ATD_CRIS_REPORT_DATE_START="01/01/2019" \
--env ATD_CRIS_REPORT_DATE_END=`date +%m/%d/%Y` \
atddocker/atd-cris-capybara bash
```

Once in the container, you can:
 
A) Launch the irb interpreter, so you can try one line at the time (with capybara)

```bash
root@9f3531f783cc:/app# xvfb-run --server-args="-screen 0 1024x768x24" irb
```

B) Run a ruby script:

```bash
root@9f3531f783cc:/app# xvfb-run --server-args="-screen 0 1024x768x24" ruby main.rb
``` 

Regardless of the case, you will need to rely on `xvfb-run` to run the interpreter for you, this is because it loads the graphic drivers necesary to run webkit headlessly (within the console).


#### Ruby IRB

It is recommended to fiddle with IRB one line at the time, why? Remember that you are working with real browser sessions, if you re-run the ruby script you are actually logging in every time; where as with IRB the session is stored in memory:


```ruby
irb(main):003:0> require 'capybara/dsl'
=> true
irb(main):004:0> require 'capybara/webkit'
=> true
irb(main):005:0>
irb(main):006:0> require './config'
=> true
irb(main):007:0> require './helpers'
=> true
irb(main):008:0>
irb(main):009:0> # We need to initialize the session using the webkit driver
=> nil
irb(main):010:0> Capybara.default_driver = :webkit
=> :webkit
irb(main):011:0> session = Capybara::Session.new(:webkit)
=> #<Capybara::Session>
irb(main):013:0> session.driver.header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36")
=> ""
irb(main):014:0> session.visit CRIS_WEBSITE
=> ""
irb(main):022:0> session.fill_in 'idpSelectInput', with: '* Texas Department of Transportation'
=> #<Capybara::Node::Element tag="input" path="/html/body/div[1]/div[2]/div[2]/div/div[@id='formContent']/div[@id='idpSelectIdPSelector']/div[@id='idpSelectIdPEntryTile']/form/input[@id='idpSelectInput']">
irb(main):023:0> session.click_button 'idpSelectSelectButton'
=> Obsolete #<Capybara::Node::Element>
```

For example, if you want to know within the session what page you are currently on, you could run something like this:

```ruby
irb(main):022:0> session.current_url
=> "https://cris.dot.state.tx.us/secure/Share/app/home/welcome"
```

or if you wanted to take a screenshot of the current state of the page:

```ruby
irb(main):058:0> session.save_screenshot
=> "/app/capybara-201907082046468551592190.png"
```

or troubleshooting a DOM selector:

```ruby
irb(main):085:0> session.find('input[ng-value="shareConstants.LOCATION_TYPE_IDS.COUNTY"]')
=> #<Capybara::Node::Element tag="input" path="/html/body/div[2]/div[@id='tcAppContent']/ui-view/ui-view/div/div/form/div[3]/div[1]/div/label/input">
```

You are literally browsing a website using Ruby

## Data Request

The data request is a separate process, this process is written in the `request.rb` file using the capybara framework
following a series of instructions to fill in data in the CRIS website.

To visualize the execution chain, it runs as follows:

`[scripts/run-request.sh]` -> `[app/app-run-request.sh]` -> `[xvfb-run]` -> `[ruby request.rb]`

`run-request.sh` has the main function of loading the environment variables into the docker container, and running the container.

`app-run-request.sh` has the main task to simplify the execution and the order of the execution of tasks. In this case we only run xvfb but the processing runs two or three separate commands.

`xvfb-run` Xvfb (short for X virtual framebuffer) is an in-memory display server for UNIX-like operating system (e.g., Linux). It enables you to run graphical applications without a display. The Capybara webkit driver needs this application in order to work.

`ruby request.rb` Runs the capybara instructions to log in to the CRIS site and to make a dataset request to be sent by email.  
   

## Data Processing

The data processing is accomplished in Python, this is because most of our processing (if not all) is written in Python. 

The processing begins in the `app-run-process.sh` file, which should be run once a day. The script will run two files,
first the `download.rb` script, which will login to the CRIS site and then download the zip files, and runs the zip
extraction commands. Secondly, it runs the `process.py` script, which will read the extracted csv files and use the
existing [knackpy](https://github.com/cityofaustin/knackpy) library.

`[scripts/run-process.sh]` -> `[app/app-run-process.sh]` -> `[xvfb-run]` -> `[ruby download.rb]` + `[python3 process.py]`

`run-request.sh` has the main function of loading the environment variables into the docker container, and running the container.

`app-run-request.sh` has the main task to simplify the execution and the order of the execution of tasks. In this case we only run xvfb but the processing runs two or three separate commands.

`xvfb-run` Xvfb (short for X virtual framebuffer) is an in-memory display server for UNIX-like operating system (e.g., Linux). It enables you to run graphical applications without a display. The Capybara webkit driver needs this application in order to work.

`ruby download.rb` Runs the capybara instructions to log in to the CRIS site to download the zip file with the csv dataset, it will also extract the data into the `tmp/` folder.

`python3 process.py` Runs the processing instructions to load the CSV into knack. 

##### *IMPORTANT: The `process.py` script requires python 3.6 or higher, if you are looking to run it locally make sure that your environment has the right version.*

## Template Models & Template Indexes

Template models and indexes are located in the file `process_templates.py`, they are a mechanism by which we can parse a csv and map it into a knack raw json object that can be inserted via the knack api.

##### *IMPORTANT: As of the time of writing, template models and indexes are written manually. Any change made to the Knack tables will require to implement the same changes in the template models.*


##### What are Template Models?

A template is a python dictionary object that mimics the data structure of a knack table. Their main role is to convert a row of CSV data into a knack-insertable raw json data with knack field id's.


##### What are Template Indexes?
The CSV file will contain columns delimited by a comma, each of these columns may or may not be in the order we want.

##### Example Use:

The CSV structure

```
crash_id,unit_id,useless_column_here,lat,long
1234,5678,'Useless Data Here',30.1234,-90.5678
```

Example Template Model:

```python
crash_data_model = {
    "crash_id": "field_256",
    "unit_id": "field_257",
    "lat": "field_258",
    "long": "field_259"
}
```

They key-pair format is: `"<unique_field_key>"` : `"<knack field_id>"`. The `unique_field_key` can be anything as long as it has a matching key in the index template.

Notice how `useless_column_here` was not included in the model, if the key is not included, then it will not be inserted into knack.

The data is populated (hydrated) into the model sequentially, the script will iterate through each key-pair value in the dictionary. 
 

Example Template index:

```python
crash_data_index = {
    "crash_id": 0,
    "unit_id": 1,
    "lat": 3,
    "long": 4
}
```

They key-pair format is: `"<unique_field_key>"` : `"<csv array index>"`. The `unique_field_key` can be anything as long as it has a matching key in the model template.

##### Why are the index and models separate? 

Because we may want to spend time in a way to gather the schema automatically, which should be relatively easy and it would follow the same structure as the model. That way the schema would be loaded automatically, there would be no need to change the file every time there is a change in the knack table structure.

##### Couldn't the index and field_id live within the same key as an array?

Yes, that is also an option to have it look like this: `"crash_id": ["field_256", 0]` and that would help get rid of the index dictionary. But we would then need to think of how to load the schema automatically if that is what we wanted to do. 

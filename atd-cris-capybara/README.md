# atd-cris-capybara

This is a tool that automates the requests to CRIS's website.

### Why using docker?

This application runs on Capybara, and our app is specifically configured to run on WebKit drivers. There are other drivers available, such as selenium, native ruby drivers, firefox, etc.

WebKit drivers are built on top of Qt5WebKit for headless browsing, which in turn has other dependencies tht need to be compiled.

Docker allows us to have a fully built container with everything already built and installed. 

### Usage

##### 1. Get the image:

Depending on your broadband speed, you may want to avoid building the image, it can take a while to build. Instead it is suggested you download it via docker-pull.

Method A (Pull already built image, it's large):

```bash
docker pull atddocker/atd-cris-capybara
```

Method B (Build image, takes very long to build)

```bash
docker build -f Dockerfile -t atddocker/atd-cris-capybara .
```

Be sure to have the source code cloned in your computer before you can build the Dockerfile.

##### 2. We run the image:

Run:

You can either:

```bash
./scripts/run.sh
```

Or you can try to run the docker command on your end:

```bash
docker run -it --rm \
--env ATD_CRIS_USERNAME=$ATD_CRIS_USERNAME \
--env ATD_CRIS_PASSWORD=$ATD_CRIS_PASSWORD \
--env ATD_CRIS_REPORT_DATE_START="01/01/2019" \
--env ATD_CRIS_REPORT_DATE_END=`date +%m/%d/%Y` \
atddocker/atd-cris-capybara \
sh -c "xvfb-run --server-args=\"-screen 0 1024x768x24\" ruby main.rb"
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
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


require 'capybara'
require 'capybara/webkit'



#
# We need to allow certain urls
#

Capybara::Webkit.configure do |config|
  config.allow_url("cris.dot.state.tx.us")
  config.allow_url("www.enterice.com")
  config.allow_url("www.google.com")
  config.allow_url("ssl.gstatic.com")
  config.allow_url("clients1.google.com")
  config.allow_url("www.google-analytics.com")
  config.allow_url("www.googletagmanager.com")
  config.allow_url("fonts.gstatic.com")
  config.allow_url("fonts.googleapis.com")
end


CRIS_WEBSITE = "https://cris.dot.state.tx.us/"
CRIS_WEBSITE_HOME = "https://cris.dot.state.tx.us/secure/Share/app/home/welcome"
CRIS_WEBSITE_ENDPOINT = "https://cris.dot.state.tx.us/secure/Share/rest/saveextractrequest"

CRIS_WEBSITE_REQUEST = {
    "type" => "https://cris.dot.state.tx.us/secure/Share/app/home/request/type",
    "location" => "https://cris.dot.state.tx.us/secure/Share/app/home/request/location",
    "date" => "https://cris.dot.state.tx.us/secure/Share/app/home/request/date",
    "summary" => "https://cris.dot.state.tx.us/secure/Share/app/home/request/summary"
}

#
# This is the payload anatomy, leaving here in case we need to use it in the future.
#
CRIS_REQUEST_TEMPLATE = {
    "locationFilterTypeId"=>2,
    "dateFilterTypeId"=>2,
    "outputFormatId"=>0,
    "requestModeId"=>1,
    "deliveryOptionId"=>2,
    "beginCrashDate"=>"2019-07-01T05:00:00.000Z",
    "endCrashDate"=>"2019-07-06T05:00:00.000Z",
    "requestUserId"=>59113,
    "extractTypeId"=>14,
    "reportedAgencyIds" => [],
    "reportedCountyIds" => [105, 227, 246], #hays, travis, williamson
    "reportedCityIds"=>[22], # City of Austin
    "mpoIds"=>[],
    "crashYearList"=>[]
}

require 'capybara'
require 'capybara/webkit'

Capybara.default_driver = :webkit

# AWS Bucket
AWS_BUCKET = ENV["AWS_BUCKET_NAME"]
AWS_DOWNLOAD_PATH = "./tmp"
AWS_BUCKET_PATH = ENV["AWS_BUCKET_PATH"] rescue "production/cris-cr3-files-unassigned"




# Hasura Accesss
HASURA_ENDPOINT = ENV["HASURA_ENDPOINT"]
HASURA_ADMIN_KEY = ENV["HASURA_ADMIN_KEY"]

# CRIS
ATD_CRIS_USERNAME = ENV['ATD_CRIS_USERNAME']
ATD_CRIS_PASSWORD = ENV['ATD_CRIS_PASSWORD']
ATD_CRIS_DOWNLOADS_PER_RUN = ENV["ATD_CRIS_DOWNLOADS_PER_RUN"] rescue 10

#
# We need to allow certain urls
#

Capybara::Webkit.configure do |config|
  config.allow_unknown_urls
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

CRIS_WEBSITE_USERAGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"

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
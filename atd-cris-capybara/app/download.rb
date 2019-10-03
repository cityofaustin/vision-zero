#
# This is a script that attempts to log in to the CRIS website
#

require 'json'
require 'base64'
require 'mail'

require 'capybara'
require 'capybara/dsl'
require 'capybara/webkit'

require './config'
require './helpers'

# We need to initialize the session using the webkit driver

session = Capybara::Session.new(:webkit)
session.driver.header("User-Agent", CRIS_WEBSITE_USERAGENT)
session.visit CRIS_WEBSITE

# ====================================
# LOGIN
# ====================================
puts "Logging in 1/2 ..."
sleep 3
# First the select department layer
session.fill_in 'idpSelectInput', with: '* Texas Department of Transportation'
session.click_button 'idpSelectSelectButton'
puts("\nSession Url Now: #{session.current_url}")
puts "Logging in 2/2 ..."
sleep 3
# Then, we need to log in
session.fill_in 'username', with: ENV['ATD_CRIS_USERNAME']
session.fill_in 'password', with: ENV['ATD_CRIS_PASSWORD']
session.click_button '_eventId_proceed'
puts("\nSession Url Now: #{session.current_url}")
sleep 3
#
# Now we wait for our home page, timeout is 60 seconds.
#
if(!waitForPage(session, CRIS_WEBSITE_HOME))
  exitError(1, "Could not log in to CRIS' website: could not verify home page access.")
else
  puts("\n\n------------------------------------------------")
  puts("Access Granted!")
  puts("Session Url Now: #{session.current_url}")
  puts("------------------------------------------------\n\n")
end





# ===================================
# Download Processing
# ===================================
# First, we need to get a list of all email files in s3 (in the pending folder)
email_collection = `aws s3 ls  --output json s3://atd-visionzero-data/txdot-email-pending/ | awk '{print $4}'`
# For each of these elements, we need to clean up each element
email_collection = email_collection.split("\n").map {|item| item = item.to_s().gsub("\n", "") }
# And get rid of empty items
email_collection = email_collection.reject { |c| c.empty? }

puts "Processing elements: #{email_collection.count}"

# No need to run if there are no elements, so let's exit here.
if(email_collection.count == 0)
  puts "Nothing to process. Exiting process."
  exit(0)
end

#
# Then we iterate through our list of email files. For each item we will:
#
email_collection.each do |current_file|
  # Download the email file
  puts "Downloading #{current_file}"
  download_success = s3_file_download(current_file)

  # Read the contents of the file, and parse it:
  raw_text = read_file(current_file)
  email_text = parse_file(raw_text)

  # No point to work on an empty file, so skip to the next file if needed.
  if(raw_text == nil)
    next
  end

  # If the email could not be parsed, then try to use raw text.
  if(email_text == nil or email_text == "")
    email_text = raw_text
  end

  # Extract the "raw" download link (this is outlook encoded)
  download_email_link = extract_link(email_text)

  # At this point we need to be able to determine
  # if we have a link or whether we need to report an error

  puts "\nURL: #{download_email_link}\n"

  # A this point, our download link is encoded within another url. Outlook likes to encode url links because they
  # want to know what you click on, so we have to get rid of them or we will get errors.
  # extract_download_link will extract that link from the outlook url.
  download_url = extract_download_link(download_email_link)
  # From our url, we will also need the token to request the download url from the api.
  download_token = extract_token(download_url)
  # Let's generate the the download request url
  download_request_url = "https://cris.dot.state.tx.us/secure/Share/rest/retrievedownload?token=#{download_token}"

  puts "Download URL: #{download_url}"
  puts "Download Token: #{download_token}"
  puts "Download Request ZIP URL: #{download_request_url}"


  session.visit download_email_link
  puts "Making ZIP Request, please wait."
  sleep 5
  begin
    # Make the request for the download zip url, this is going to change the session.body with the contents we need.
    session.visit download_request_url
    # We must extract the zip download url from the body
    zip_url = "https://cris.dot.state.tx.us" + session.body[/(\<downloadExtractUrl)(.+)(downloadExtractUrl\>)/][20..-22]
    # Let's print it for our logs
    puts "\nZip URL: #{zip_url}\n"
    # Let's give it 3 seconds to load
    sleep 3
    # We will now make the request to download the zip file
    download_file(zip_url)

    # Lastly, we will extract the files
    extract_file
  rescue Exception => e
    puts("Error while downloading: " + e.message)
    puts(session.body)
  end
end

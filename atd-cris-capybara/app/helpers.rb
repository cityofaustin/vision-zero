#
# This file contains functions and constants needed by the main app
#
require 'json'
require 'capybara'
require 'capybara/dsl'
require 'capybara/webkit'
require 'uglifier'

require './config'

#
# A basic ajax script template, no error handling necessary.
#
JQUERY_STRING = <<EOJ
(function(){
    var request = 'CRIS_REQUEST_TEMPLATE';

    $.ajax({
        type: 'post',
        url: 'CRIS_WEBSITE_ENDPOINT',
        data: JSON.stringify(request),
        contentType: "application/json; charset=utf-8",
        traditional: true
    })
})()
EOJ



def generate_payload()
  return Uglifier.compile(JQUERY_STRING.to_s.gsub('CRIS_REQUEST_TEMPLATE', CRIS_REQUEST_TEMPLATE.to_json).gsub('CRIS_WEBSITE_ENDPOINT', CRIS_WEBSITE_ENDPOINT))
end

def exitError(errorCode, message)
  print "Error: #{message}"
  exit(errorCode)
end

def waitForPage(session, url, timeDifferenceMaxInSec=60)
  #
  # Now we wait for our home page, timeout is 60 seconds.
  #
  current_time = Time.now
  puts "Expected: #{url}"
  puts "Current: #{session.current_url}"
  # Exit if while loop took longer than 60 seconds,
  # meaning we could never get to the home page.
  while(true) do
    timeDifference = Integer(Time.new - current_time) # Difference in seconds

    # If we have a timeout, exit with false
    if(timeDifference >= timeDifferenceMaxInSec)
      return false
    # If we are good to go, return true...
    elsif (session.current_url == url)
      return true
    else # wait 1 second
      sleep 1
    end
  end
end

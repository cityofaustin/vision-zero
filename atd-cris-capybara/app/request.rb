#
# This is a script that attempts to log in to the CRIS website
#
require 'json'
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

# First the select department layer
session.fill_in 'idpSelectInput', with: '* Texas Department of Transportation'
session.click_button 'idpSelectSelectButton'
puts("\nSession Url Now: #{session.current_url}")

# Then, we need to log in
session.fill_in 'username', with: ENV['ATD_CRIS_USERNAME']
session.fill_in 'password', with: ENV['ATD_CRIS_PASSWORD']
session.click_button '_eventId_proceed'
puts("\nSession Url Now: #{session.current_url}")

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






# ====================================
# MAKE THE REQUEST
# ====================================
session.save_screenshot
session.click_button("Create Data Extract Request")

#
# TYPE
#
if(!waitForPage(session, CRIS_WEBSITE_REQUEST["type"]))
  exitError(1, "Could not log in to CRIS' website: could not verify access to type page")
else
  puts("Session Url Now: #{session.current_url}")
end
session.save_screenshot
# We can accept the default values
session.click_button("Continue")



#
# LOCATION
#
if(!waitForPage(session, CRIS_WEBSITE_REQUEST["location"]))
  exitError(1, "Could not log in to CRIS' website: could not verify access to location page")
else
  puts("Session Url Now: #{session.current_url}")
end

# # Include Crash Report Data from specific counties
session.find('input[ng-value="shareConstants.LOCATION_TYPE_IDS.COUNTY"]').click

# Select Counties
session.execute_script("$(\"div[data-value='105']\").click()") # Travis
session.execute_script("$(\"div[data-value='227']\").click()") # Williamson
session.execute_script("$(\"div[data-value='246']\").click()") # Hays
session.save_screenshot
session.click_button("Continue")






#
# DATE
#
if(!waitForPage(session, CRIS_WEBSITE_REQUEST["date"]))
  exitError(1, "Could not log in to CRIS' website: could not verify access to date page")
else
  puts("Session Url Now: #{session.current_url}")
end
# session.find('input[ng-value="shareConstants.DATE_TYPE_IDS.CRASH"]').click
# session.fill_in 'requestDateCrashBegin', with: get_request_start_date()
# session.fill_in 'requestDateCrashEnd', with: get_request_end_date()
session.find('input[ng-value="shareConstants.DATE_TYPE_IDS.PROCESS"]').click
session.fill_in 'requestDateProcessBegin', with: get_request_start_date()
session.fill_in 'requestDateProcessEnd', with: get_request_end_date()

session.save_screenshot
session.click_button("Continue")

if(!waitForPage(session, CRIS_WEBSITE_REQUEST["summary"]))
  exitError(1, "Could not log in to CRIS' website: could not verify access to summary page")
else
  puts("Session Url Now: #{session.current_url}")
end



print "Processing, one second. ["
while(!session.has_text?('Extract Request Summary'))
  print(".")
  sleep 1
end

session.save_screenshot

# ====================================
# Submission
# ====================================
session.click_button("Submit")
session.save_screenshot
print ("] Done! Please wait 10 seconds.\n")

#
# Test
#
sleep 10
puts "Execution finished, request sent."
session.save_screenshot
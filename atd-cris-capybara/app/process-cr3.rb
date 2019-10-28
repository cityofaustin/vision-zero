#
# This is a script that attempts to log in to the CRIS website
#
require 'base64'
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
session.fill_in 'username', with: "mclark@austintexas.gov"
session.fill_in 'password', with: "qTt4PFFcg-e9nunC"
session.click_button '_eventId_proceed'
puts("\nSession Url Now: #{session.current_url}")


# ====================================
# SAVE A SCREENSHOT OF CURRENT PAGE
# ====================================
session.save_screenshot

# ====================================
# IMPORT CRASH RECORDS TO SEARCH 
# ====================================


require 'csv'

crashes = CSV.parse(File.read("./data/2019-10-25-crashes.csv"), headers: true)

for crash in crashes do    
    crashId = crash["crash_id"]
    crashEnc = Base64.encode64("CrashId=" + crashId).strip!
    session.visit "https://cris.dot.state.tx.us/secure/ImageServices/DisplayImageServlet?target=" + crashEnc
    session.save_page(crashId + ".pdf")
    puts "Record saved to: " + crashId + ".pdf"
    session.save_screenshot
    session.save_page(crashId + ".pdf")
end







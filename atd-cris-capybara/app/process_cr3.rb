#
# This is a script that attempts to log in to the CRIS website
#
require 'base64'
require 'json'

require 'net/http'
require 'uri'

require 'capybara'
require 'capybara/dsl'
require 'capybara/webkit'

require './config'
require './helpers'

require './process_cr3/graphql'
require './process_cr3/aws'

puts "Current Hasura Endpoint: #{HASURA_ENDPOINT}"

# Catch Starting time of this process
starting = Process.clock_gettime(Process::CLOCK_MONOTONIC)

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
session.fill_in 'username', with: ATD_CRIS_USERNAME
session.fill_in 'password', with: ATD_CRIS_PASSWORD
session.click_button '_eventId_proceed'
puts("\nSession Url Now: #{session.current_url}")

puts "Downloading a total of '#{ATD_CRIS_DOWNLOADS_PER_RUN}' PDF files for this run."

# Give the app time to load, 5 seconds should be enough...
sleep(5)

# ====================================
# GraphQL Queries (Query and Mutation)
# ====================================

queryCrashesCR3 = <<-QUERY
query CrashesWithoutCR3 {
  atd_txdot_crashes(
    limit: #{ATD_CRIS_DOWNLOADS_PER_RUN}, 
    where: {
      city_id: {_eq: 22}
      cr3_stored_flag: {_eq: "N"}
    }
  ) {
    crash_id
  }
}
QUERY

updateRecordCR3 = <<-MUTATION
mutation CrashesUpdateRecordCR3 {
  update_atd_txdot_crashes(where: {crash_id: {_eq: CRASH_RECORD_ID}}, _set: {cr3_stored_flag: "Y", updated_by: "System"}) {
    affected_rows
  }
}
MUTATION

#
# First make a query gathering data
#
res = graphql_query(queryCrashesCR3)

if res.code == "200"
  crashes = JSON.parse(res.body)["data"]["atd_txdot_crashes"] rescue []
  crashes.each do |crash|
    crash_id = "#{crash["crash_id"]}"
    crash_encoded = Base64.encode64("CrashId=#{crash_id}").strip!
    session.visit "https://cris.dot.state.tx.us/secure/ImageServices/DisplayImageServlet?target=#{crash_encoded}"
    sleep(1)
    session.save_screenshot "/app/tmp/#{crash_id}.png"
    body = session.body rescue ""

    if "#{body.lines.first}".include?("PDF") && "#{body.lines.last}".include?("%%EOF")
      puts "Saving CR3 /app/tmp/#{crash_id}.pdf"
      session.save_page("/app/tmp/#{crash_id}.pdf")
      puts "Record saved to: /app/tmp/#{crash_id}.pdf"

      puts "Copying to s3"
      upload_s3("/app/tmp/#{crash_id}.pdf", "s3://#{AWS_BUCKET}/#{AWS_BUCKET_PATH}/#{crash_id}.pdf")
      mutation = updateRecordCR3.gsub("CRASH_RECORD_ID", crash_id)
      puts mutation
      mutation_res = graphql_query(mutation)
      puts "Mutation Response: #{mutation_res.body}"
    else
      puts "Download Failed for #{crash_id}"
    end
  end

  cleanup
else
  puts "Error: #{res.message}"
end


# Final Cleanup
cleanup

# Capture ending time & calc difference
ending = Process.clock_gettime(Process::CLOCK_MONOTONIC)
elapsed = ending - starting

puts "Processed finished in #{elapsed} (seconds)"





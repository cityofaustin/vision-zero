#
# This file contains functions and constants needed by the main app
#
require 'json'
require 'capybara'
require 'capybara/dsl'
require 'capybara/webkit'

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

  # Exit if while loop took longer than 60 seconds,
  # meaning we could never get to the home page.
  while(true) do
    timeDifference = Integer(Time.new - current_time) # Difference in seconds
    puts "Expected: #{url}"
    puts "Current: #{session.current_url}"
    puts "timeDifference: #{timeDifference}"
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



# Returns the file name from an s3 key (url)
def get_filename(s3key)
  File.basename(s3key, "") rescue nil
end

# Reads the contents of a file from the AWS_DOWNLOAD_PATH, key is the file name.
def read_file(key)
  File.read("#{AWS_DOWNLOAD_PATH}/#{key}")
end

# It parses the contents of an email file using the Mail library. emailString is the full body of the file.
def parse_file(emailString)
  output = nil
  if(emailString.to_s.empty?)
    return output
  end
  begin
    text_part = Mail.new(emailString).text_part.to_s
    emailString = text_part.split("\r\n\r\n").last().gsub("\r\n", "")
    output = Base64.decode64(emailString)
    if(output.include? "Download Extract" == false)
      print("You should have a raw text part")
      return text_part # Return the raw text if not decoded..
    end
  rescue
    print "parse_file() Error: The string is not base 64?"
    return Mail.new(emailString).text_part.to_s
  end
  return output
end




# Downloads a file from s3 using the aws-cli tool, it is faster and leaner than the ruby aws sdk.
def s3_file_download(key)
  puts "s3_file_download() Downloading Email: #{key}"
  begin
    # Extract the file name only
    return system("aws s3 cp s3://#{AWS_BUCKET}/txdot-email-pending/#{key} #{AWS_DOWNLOAD_PATH}/#{key}")
  rescue Exception => e
    puts "There was a problem: #{e.message}"
    return false
  end
end

# Downloads a file from a url using wget
def download_file(zip_file)
  system("wget '#{zip_file}' -O #{AWS_DOWNLOAD_PATH}/data.zip")
end

# Extracts the csv files from the password-protected 7z files
def extract_file()
  system("7z x #{AWS_DOWNLOAD_PATH}/data.zip -o#{AWS_DOWNLOAD_PATH}/data -p$ATD_CRIS_PASSWORD")
end


# Extracts the download URL link from the email string
def extract_link(emailString)
  emailString.gsub("\r\n", "")[/\<(https)(.+)3D0\>/][1..-2]
end

# Extracts the download link from outlook-encoded urls
def extract_download_link(outlookurl)
  URI.decode(outlookurl.split("url=3D")[1].gsub("=",""))[0..161]
end

# Extracts the download token from a string (requestLink)
def extract_token(requestLink)
  requestLink[/[a-zA-Z0-9]{96}/]
end

def get_request_start_date()
  start_date_env = ENV['ATD_CRIS_REPORT_DATE_START']
  if start_date_env.to_s().empty?
    time = (Time.now - 86400)
    return time.strftime("%m/%d/%Y")
  else
    return ENV['ATD_CRIS_REPORT_DATE_START']
  end
end


def get_request_end_date()
  start_date_env = ENV['ATD_CRIS_REPORT_DATE_END']
  if start_date_env.to_s().empty?
    time = Time.now
    return time.strftime("%m/%d/%Y")
  else
    return ENV['ATD_CRIS_REPORT_DATE_END']
  end
end

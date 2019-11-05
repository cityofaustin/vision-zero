

def upload_s3(filename, destination)
  puts `aws s3 cp #{filename} #{destination}`
end


def cleanup()
  puts "Removing PNG screenshots"
  puts `rm /app/tmp/*.png`
  puts "Removing all PDFs"
  puts `rm /app/tmp/*.pdf`
end
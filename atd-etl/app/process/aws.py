
import subprocess

def run_command(command):
    """
    Runs a shell command, returns output
    :param command:  string
    :return:  string
    """

    return subprocess.run([command], stdout=subprocess.PIPE).stdout.decode("utf-8")


def upload_s3(filename, destination):
    """
    Uploads a file to S3
    :param filename: string - Path to the file to upload to s3
    :param destination: string - Path to the destination folder
    """
    print(run_command("aws s3 cp %s %s" % (filename, destination)))


def cleanup():
    """
    Removes pdf and png files from the temporal folder
    """
    print("Removing PNG screenshots")
    run_command("rm /app/tmp/*.png")
    print("Removing all PDFs")
    run_command("rm /app/tmp/*.pdf")
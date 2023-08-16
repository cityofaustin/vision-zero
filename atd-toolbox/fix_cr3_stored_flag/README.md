This folder contains a script that gets a list of crash ids we have CR3 PDFs for in our AWS S3 bucket and checks them against crashes in the atd_txdot_crashes table where cr3_stored_flag = 'Y'. It updates cr3_stored_flag to 'N' if those crash IDs aren't in the list of CR3s we have. This fixes an error in the VZE where the Download CR3 button gives the "NoSuchKey The specified key does not exist" when you click on it.

### AWS CLI

Make sure you have the AWS CLI installed: https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html

You will then need to configure the AWS CLI to your AWS IAM user by running:

`aws configure`

### Env file

Rename the env_template.py file to env.py. Fill in the values.

### Running the script

When you run this script make sure you are in this directory. A txt file will be created in your current directory that contains the file names of CR3 PDFs we have in our S3 bucket. This file is later used to be compared to records in the atd_txdot_crashes table where the cr3_stored_flag = 'Y'.

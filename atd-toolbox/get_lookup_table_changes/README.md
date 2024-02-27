This folder and the script it contains is for the purpose of getting our lookup tables up to date with the latest lookup export from CRIS. We will probably need to run this after every major CRIS release.

### Install packages

Create or activate your virtual python environment using [venv](https://docs.python.org/3/library/venv.html).

Install packages from the requirements.txt file:

`pip install -r requirements.txt`

### Env file

Rename the env_template to env

Fill in the values using your credentials for the VZ read replica.

### Running the script

In order to run this script you need to have a recent CRIS lookup table export csv and provide the file path as an argument in the command line like so:

`python3 get_lookup_table_changes.py --input path_to_extract.csv `

Running `get_lookup_table_changes.py` can take awhile, so sit tight. Once the script is done, a file will be created in this directory called `up_migrations.sql` that contains all of the sql commands generated from running the script. The contents of this file can then be used to create a migration in the hasura console so we can track these huge changes. A file called `down_migrations.sql` is also created in this directory which you can use as the down migration.

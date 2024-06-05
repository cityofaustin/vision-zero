# this endpoint points to the sheet with the crashes.id primary key configuration
COLUMN_ENDPOINT = "https://docs.google.com/spreadsheets/d/1oHzKt8Cvd1BGpZ7KJl4dfBDHGuSl7gs4yN0OM7AJMBA/export?format=csv&gid=0"
# this endpoint points to the sheet without the crashes.id primary key configuration
# COLUMN_ENDPOINT = "https://docs.google.com/spreadsheets/d/1oHzKt8Cvd1BGpZ7KJl4dfBDHGuSl7gs4yN0OM7AJMBA/export?format=csv&gid=914298745"
LOOKUP_SEEDS_ENDPOINT = "https://docs.google.com/spreadsheets/d/1oHzKt8Cvd1BGpZ7KJl4dfBDHGuSl7gs4yN0OM7AJMBA/export?format=csv&gid=1470256834"
SCHEMA_NAME = "public"
BASE_MIGRATION_ID = 1715960000005 # increment this to be higher than any migrations on the destination branch
# relative to ./atd-toolbox/data_model/python ;)
MIGRATIONS_PATH = "../../../atd-vzd/migrations/default"

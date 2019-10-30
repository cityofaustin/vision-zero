#
# Processes Data from CSV into Postgres
#

import sys

from process.helpers import generate_gql, record_exists

FILE_TYPE = sys.argv[1]
FILE_PATH = sys.argv[2]

print("Processing file '%s' of type '%s'" % (FILE_PATH, FILE_TYPE))

fieldnames = []
with open(FILE_PATH) as fp:
    line = fp.readline()
    cnt = 1
    while line:
        if cnt == 1:
            fieldnames = line.strip().split(",")

        else:
            if record_exists(line=line, type=FILE_TYPE):
                print("Record exists")
            else:
                print("Record does not exist")
                gql = generate_gql(line=line, fieldnames=fieldnames, type=FILE_TYPE)
                print(gql)

        line = fp.readline() # Move pointer to next line
        cnt += 1    # Increase count

        if cnt == 5:
            break
#
# All queries necessary to run this thing...
#

def searchCrashQuery(crash_id):
    return """
        query MyQuery {
          atd_txdot_crashes(limit: 1, where: {crash_id: {_eq: %CRASH_ID%}}){
            crash_id
          }
        }
    """.replace("%CRASH_ID%", crash_id)


def searchPerson(line):
    return "person"

def searchPrimaryPerson(line):
    return "primaryperson"

def searchCharges(line):
    return "charges"

def searchUnits(line):
    return "units"
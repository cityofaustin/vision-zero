from openpyxl import load_workbook
import re
import json

def process_worksheet(worksheet, lookups):
    """
    Process a worksheet based on title specification and update the lookups dictionary.
    """
    #print("Title: ", worksheet.title.lower())

    for row in worksheet.iter_rows(values_only=True, min_row=9):
        if 'lookup' in str(row[10]).lower():
            #print("")
            match = re.search(r"#'(\w+)_LKP'", row[9])
            lookup_table = match.group(1).lower() if match else None
            field = (str(row[7]).split('.')[1].lower())

            #print(f"Lookup Table: '{lookup_table}'")
            #print(f"Field: '{field}'")
            lookups[field] = lookup_table

def read_xlsx_to_get_FK_relationships(file_path):
    # Load the workbook
    workbook = load_workbook(filename=file_path)

    crash_lookups = dict()
    unit_lookups = dict()
    person_lookups = dict()
    primaryperson_lookups = dict()


    for worksheet in workbook.worksheets:
        if worksheet.title.lower() == "crash file specification":
            process_worksheet(worksheet, crash_lookups)
        if worksheet.title.lower() == "unit file specification":
            process_worksheet(worksheet, unit_lookups)
        if worksheet.title.lower() == "person file specification":
            process_worksheet(worksheet, person_lookups)
        if worksheet.title.lower() == "primaryperson file spec.":
            process_worksheet(worksheet, primaryperson_lookups)

    print(json.dumps(crash_lookups, indent=4))
    print(json.dumps(unit_lookups, indent=4))
    print(json.dumps(person_lookups, indent=4))
    print(json.dumps(primaryperson_lookups, indent=4))

def main():
    read_xlsx_to_get_FK_relationships("/data/cris_spec.xlsx")

if __name__ == "__main__":
    main()
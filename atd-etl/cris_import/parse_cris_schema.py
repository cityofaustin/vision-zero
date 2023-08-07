from openpyxl import load_workbook
import re
import json

def read_xlsx(file_path):
    # Load the workbook
    workbook = load_workbook(filename=file_path)

    crash_lookups = dict()
    unit_lookups = dict()
    person_lookups = dict()
    primaryperson_lookups = dict()

    for worksheet in workbook.worksheets:
        if worksheet.title.lower() == "crash file specification":
            print("Title: ", worksheet.title.lower())

            for row in worksheet.iter_rows(values_only=True, min_row=9):
                if 'lookup' in str(row[10]).lower():
                    print("")
                    match = re.search(r"#'(\w+)_LKP'", row[9])
                    lookup_table = match.group(1).lower() if match else None
                    field = (str(row[7]).split('.')[1].lower())

                    print(f"Lookup Table: '{lookup_table}'")
                    print(f"Field: '{field}'")
                    crash_lookups[field] = lookup_table

    for worksheet in workbook.worksheets:
        if worksheet.title.lower() == "unit file specification":
            print("Title: ", worksheet.title.lower())

            for row in worksheet.iter_rows(values_only=True, min_row=9):
                if 'lookup' in str(row[10]).lower():
                    print("")
                    match = re.search(r"#'(\w+)_LKP'", row[9])
                    lookup_table = match.group(1).lower() if match else None
                    field = (str(row[7]).split('.')[1].lower())

                    print(f"Lookup Table: '{lookup_table}'")
                    print(f"Field: '{field}'")
                    unit_lookups[field] = lookup_table


    for worksheet in workbook.worksheets:
        if worksheet.title.lower() == "person file specification":
            print("Title: ", worksheet.title.lower())

            for row in worksheet.iter_rows(values_only=True, min_row=9):
                if 'lookup' in str(row[10]).lower():
                    print("")
                    match = re.search(r"#'(\w+)_LKP'", row[9])
                    lookup_table = match.group(1).lower() if match else None
                    field = (str(row[7]).split('.')[1].lower())

                    print(f"Lookup Table: '{lookup_table}'")
                    print(f"Field: '{field}'")
                    person_lookups[field] = lookup_table

    for worksheet in workbook.worksheets:
        if worksheet.title.lower() == "primaryperson file specification":
            print("Title: ", worksheet.title.lower())

            for row in worksheet.iter_rows(values_only=True, min_row=9):
                if 'lookup' in str(row[10]).lower():
                    print("")
                    match = re.search(r"#'(\w+)_LKP'", row[9])
                    lookup_table = match.group(1).lower() if match else None
                    field = (str(row[7]).split('.')[1].lower())

                    print(f"Lookup Table: '{lookup_table}'")
                    print(f"Field: '{field}'")
                    primaryperson_lookups[field] = lookup_table

    


def main():
    read_xlsx("/data/cris_spec.xlsx")

if __name__ == "__main__":
    main()
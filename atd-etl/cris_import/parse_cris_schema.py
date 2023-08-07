from openpyxl import load_workbook
import re

def read_xlsx(file_path):
    # Load the workbook
    workbook = load_workbook(filename=file_path)

    for worksheet in workbook.worksheets:
        if worksheet.title.lower() == "crash file specification":
            print("Title: ", worksheet.title.lower())

            for row in worksheet.iter_rows(values_only=True, min_row=9):
                if 'lookup' in str(row[10]).lower():
                    print("")
                    #print("Row 7: ", row[7])
                    #print("Row 8: ", row[8])
                    #print("Row 9: ", row[9])
                    #print("Row 10: ", row[10])
                    #print("Row 11: ", row[11])


                    match = re.search(r"#'(\w+)_LKP'", row[9])
                    lookup_table = match.group(1).lower() if match else None
                    field = (str(row[7]).split('.')[1].lower())
                    table = str(row[10]).lower()

                    print(f"Lookup Table: '{lookup_table}'")
                    print(f"Field: '{field}'")


def main():
    read_xlsx("/data/cris_spec.xlsx")

if __name__ == "__main__":
    main()
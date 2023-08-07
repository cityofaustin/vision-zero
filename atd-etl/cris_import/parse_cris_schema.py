def read_xlsx(file_path):
    # Load the workbook
    workbook = load_workbook(filename=file_path)

    # Get the first sheet (you can also get sheets by name: workbook["Sheet1"])
    sheet = workbook.worksheets[0]

    # Iterate through each row in the sheet
    for row in sheet.iter_rows(values_only=True):
        # row is a tuple of all the cells in the row
        print(row)

read_xlsx("/path/to/your/file.xlsx")
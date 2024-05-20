import os
import subprocess


def generate_pgloader_command(csv_file_path, db_connection_string):
    # Generate the pgloader command file content
    pgloader_command = f"""
    LOAD CSV
    FROM '{csv_file_path}'
    INTO {db_connection_string}
    WITH truncate,
         fields terminated by ',',
         fields escaped by '\\\\',
         fields enclosed by '"'
    SET work_mem to '12MB',
        maintenance_work_mem to '64MB';
    """
    return pgloader_command


def write_and_execute_pgloader_command(csv_file_path, db_connection_string, output_dir):
    # Get the base name of the CSV file to use as the command file name
    base_name = os.path.basename(csv_file_path)
    command_file_name = f"{base_name}.load"
    command_file_path = os.path.join(output_dir, command_file_name)

    # Generate the pgloader command
    pgloader_command = generate_pgloader_command(csv_file_path, db_connection_string)

    # Write the command to a file
    with open(command_file_path, "w") as command_file:
        command_file.write(pgloader_command)

    # Execute the pgloader command
    # subprocess.run(["pgloader", command_file_path])


def process_directory(root_dir, db_connection_string, output_dir):
    for subdir, _, files in os.walk(root_dir):
        for file in files:
            if file.endswith(".csv"):
                csv_file_path = os.path.join(subdir, file)
                write_and_execute_pgloader_command(
                    csv_file_path, db_connection_string, output_dir
                )


if __name__ == "__main__":
    root_dir = "./extracts"
    output_dir = "./load_files"

    # Get the database connection string from the environment variable
    db_connection_string = os.getenv("DATABASE_CONNECTION")

    if db_connection_string is None:
        raise EnvironmentError("DATABASE_CONNECTION environment variable is not set")

    process_directory(root_dir, db_connection_string, output_dir)

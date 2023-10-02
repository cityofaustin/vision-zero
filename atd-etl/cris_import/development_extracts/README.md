# CRIS extracts used for development go in here.

If you run the `cris_import.py` program in such a way that there are files which match the `/app/development_extracts/*zip` pattern, the program will use those and not attempt to find extracts on the SFTP endpoint. Additionally, the program will not remove the zip file from the local directory.
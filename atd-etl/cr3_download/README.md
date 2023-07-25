## CRIS CR3 .pdf Downloads

### Invocation

After creating an .env file using the variables listed in the env_template file, you can run this script with:

If you are running this for the first time or developing this script, you will need to run and build:
```
$ docker compose run --build -it cr3_download python cr3_download.py
```

Otherwise, you can run:
```
$ docker compose run -it cr3_download python cr3_download.py
```

The script will prompt for the cookie and then download any pending CR3s.
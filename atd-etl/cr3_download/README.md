## CRIS CR3 .pdf Downloads

### Invocation

After creating an .env file using the variables listed in the env_template file, you can run this script with:

If you are running this for the first time or developing this script, you will need to run and build:
```
$ docker compose run --build cr3_download
```

Otherwise, you can run:
```
$ docker compose run cr3_download
```

There are two optional flags you can include
`-t`, `--threads` Number of concurrent downloaders, default is 5
`-v`, `--verbose` Enable verbose logging

The script will prompt for the cookie and then download any pending CR3s.

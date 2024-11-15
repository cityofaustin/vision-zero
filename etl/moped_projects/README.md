# Moped Project Components Spatial Join 

This ETL generates a lookup table of [Moped](https://github.com/cityofaustin/atd-moped/) mobility project components
(such as  bike lanes, traffic signals, sidewalks) and crashes. This is used to evaluate the impact of Austin's 
mobility projects and crashes.

`moped_project_components_spatial_join.py` buffers the project geometry (points and lines) to a distance of 40 feet
then spatially joins the crashes that are inside of that polygon.

## Docker

It is recommended to run this script using the docker container. You can build it using:

Note, if you are on Apple Silicon you may need to add `--platform linux/amd64` to get GDAL to install correctly.

```
docker build . -t atddocker/vz-moped-join
```

```
docker run -it --env-file env_file atddocker/vz-moped-join /bin/bash
python moped_project_components_spatial_join.py
```

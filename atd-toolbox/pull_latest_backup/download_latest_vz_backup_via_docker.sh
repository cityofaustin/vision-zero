#!/bin/bash

docker run --rm -it -v ~/.aws:/root/.aws -v `pwd`:/mnt amazon/aws-cli s3 cp s3://atd-vision-zero-database/backups/atd_vz_data_production/public/`date -j -v2d  +"%Y-%m-%d"`/atd_vz_data-full.sql.gz /mnt/atd_vz_data-full.sql.gz


### Script for cr3 diagram extract 


| Argument | Description | Required |
|----|------|----|
| -v | be verbose | |
| -d | check for digitally created PDFs | |
| --cr3-source | cr3 files bucket name and path| yes |
| --batch-size | cr3s to process, default is 1 | |
| --update-narrative | update narrative in database |  |
| --update-timestamp | update timestamp in database | |
| --save-diagram-s3 | bucket name and path to save diagrams |  |
| --save-diagram-disk | save diagram PNG in certain directory | |
| --crash-id | specific crash ID to operate on |  |


The script is currently scheduled in [airflow](https://github.com/cityofaustin/atd-airflow/blob/production/dags/vz_cr3_extract_ocr_narrative.py) with the following parameters: 

```
cr3_extract_diagram_ocr_narrative.py -v -d --update-narrative --update-timestamp --batch 100 \
  --cr3-source atd-vision-zero-editor production/cris-cr3-files \
  --save-diagram-s3 atd-vision-zero-website cr3_crash_diagrams/production
```

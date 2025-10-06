# docker compose build
# docker compose run backfill
import os
import boto3

ENV = os.getenv("BUCKET_ENV")
BUCKET_NAME = os.getenv("BUCKET_NAME")
folder_prefix = f"{ENV}/cr3s/pdfs/"

# set up our S3 bucket paginator
s3 = boto3.client("s3")
paginator = s3.get_paginator("list_objects_v2")
pages = paginator.paginate(Bucket=BUCKET_NAME, Prefix=folder_prefix)

count = 0
for page in pages:
    if "Contents" in page:
        # for each item in the bucket
        for obj in page["Contents"]:
            count += 1
            key = obj["Key"]
            # if the obj is a .pdf file
            if key.lower().endswith(".pdf"):
                response = s3.head_object(Bucket=BUCKET_NAME, Key=key)
                current_content_type = response.get("ContentType", "")
                # check content type to skip files with the correct ContentType
                if current_content_type != "application/pdf":
                    # copy object to itself with updated metadata
                    s3.copy_object(
                        Bucket=BUCKET_NAME,
                        Key=key,
                        CopySource={"Bucket": BUCKET_NAME, "Key": key},
                        ContentType="application/pdf",
                        MetadataDirective="REPLACE",
                    )
                    print(f"({count}) Updated: {key}")
                else:
                    print(
                        f"** No update because content type is {current_content_type} **"
                    )

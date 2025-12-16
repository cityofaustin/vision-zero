alter table people add column image_s3_object_key text;

comment on column people.image_s3_object_key is 'The S3 object key of an image of the person stored in AWS S3. Used for fatalities only.'

alter table people
    add column image_s3_object_key text,
    add column image_source text,
    add column image_original_filename text;

comment on column people.image_s3_object_key is 'The S3 object key of an image of the person stored in AWS S3. Used for fatalities only.';

comment on column people.image_source is 'A description of the source of the image, e.g a website URL';

comment on column people.image_original_filename is 'The original name of the uploaded file.';

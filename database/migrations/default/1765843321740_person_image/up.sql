alter table people add column image_filename text;

comment on column people.image_filename is 'The filename of an image of the person stored in AWS S3. Used for fatalities only.'

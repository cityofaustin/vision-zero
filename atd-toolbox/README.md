# ATD - Toolbox
This is a collection of scripts which have been written to serve a one-time or infrequent purpose. They are not intended to be run in an automated fashion, and commonly would be used from the command line when needed. They will each have different parameters and possible environment variables which need to be set for the script to function as intended. 

##### `s3_restore_cr3_pdfs/`
This contains a Python script will take a JSON file of crash ids, and download and check the CR3 file stored in S3 for each crash. It will verify the type of file using the `libmagic` library will restore the most recent `application/pdf` from the S3 version history of the file. 

##### `reposition_crashes_to_centroid_svrd_locations/`
This is a Python script which will use a database view to find the set of crashes which:
* Are on a level 5 centerline,
* Have CR3 data which indicates that the crash occurred on a service road,
* Have a directionality which gives a hint which way off the centerline the crash should be moved.

For these crashes, the script will add 0.00000001 decimal degrees to the latitude of the crash, which is an immaterial movement in geographic terms, but it will cause the lambda function tied to crash-updates to execute. It is this lambda function which will figure out what location to move the crash to and will do so.

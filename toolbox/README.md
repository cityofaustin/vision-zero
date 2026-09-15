# Toolbox

This is a collection of scripts which support recurring maintence tasks. Scripts which have been written to serve a one-time or historical purpose can be found in the `/archive` subdirectory.

## Contents

### ArcGIS Online Layer Helper - `load_agol_layer`

Nodejs tool load ArcGIS Online (AGOL) layers into the Vision Zero database.

### Lookup table helper - `get_lookup_table_changes`

Script which compares lookup tables between a CRIS extract and the VZ database and generates database migrations. We should run this script after CRIS software releases.

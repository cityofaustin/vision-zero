# Load non-COA roadways into Vision Zero

1. Install dependencies - requires node v18.x

```shell
$ npm install
```

2. Save `secrets_template.js` as `secrets.js`. Optional add secrets for `staging` or `prod`

3. Get a new AGOL token and replace the token that is hardcoded in the ROADWAYS_URL, you can do this by running the following command:

```shell
$ curl -X POST \
  -F "username=$AGOL_USERNAME" \
  -F "password=$AGOL_PASSWORD" \
  -F "referer=http://www.arcgis.com" \
  -F "f=pjson" \
  https://austin.maps.arcgis.com/sharing/rest/generateToken
```

4. Download the non coa roadways - they will be saved to data/non_coa_roadways.geojson

```shell
$ node process_roadways.js
```

5. Upload to Hasura (requires local instance running)

```shell
$ node insert_roadways.js local
```

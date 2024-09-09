# Load council districts into Vision Zero

1. Install dependencies - requires node v18.x

```shell
$ npm install
```

2. Save `secrets_template.js` as `secrets.js`. Optional add secrets for `staging` or `prod`

3. Download the non coa roadways - they will be saved to data/non_coa_roadways.geojson

```shell
$ node process_roadways.js
```

4. Upload to Hasura (requires local instance running)

```shell
$ node insert_roadways.js local
```

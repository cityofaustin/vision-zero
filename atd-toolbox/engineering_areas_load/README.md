# Load engineering areas into Vision Zero

1. Install dependencies - requires node v18.x

```shell
$ npm install
```

2. Save `secrets_template.js` as `secrets.js`. Optional add secrets for `staging` or `prod`

3. Download the latest engineering areas - they will be saved to data/engineering_areas.geojson

```shell
$ node process_areas.js
```

4. Upload to Hasura (requires local instance running)

```shell
$ node insert_areas.js local
```

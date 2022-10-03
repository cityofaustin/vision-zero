// This API key is managed by CTM. Contact help desk for maintenance and troubleshooting.
const NEARMAP_KEY = process.env.REACT_APP_NEARMAP_KEY;

export const LOCATION_MAP_CONFIG = {
  mapStyle: "mapbox://styles/mapbox/satellite-streets-v11",
  sources: {
    aerials: {
      id: "raster-tiles",
      type: "raster",
      tiles: [
        `https://api.nearmap.com/tiles/v3/Vert/{z}/{x}/{y}.jpg?apikey=${NEARMAP_KEY}`,
        // testing basic raster tile server for TX, US
        //`https://tiles.frankhereford.io/tile/{z}/{x}/{y}.png`,
      ],
      tileSize: 256,
    },
  },
  layers: {
    aerials: {
      id: "simple-tiles",
      type: "raster",
      source: "raster-tiles",
      minzoom: 0,
      maxzoom: 22,
    },
    streetLabels: {
      // borrowed from mapbox mapbox streets v11 style
      type: "symbol",
      metadata: {
        "mapbox:featureComponent": "road-network",
        "mapbox:group": "Road network, road-labels",
      },
      source: "composite",
      "source-layer": "road",
      minzoom: 12,
      filter: [
        "all",
        ["has", "name"],
        [
          "match",
          ["get", "class"],
          [
            "motorway",
            "trunk",
            "primary",
            "secondary",
            "tertiary",
            "street",
            "street_limited",
          ],
          true,
          false,
        ],
      ],
      layout: {
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10,
          [
            "match",
            ["get", "class"],
            ["motorway", "trunk", "primary", "secondary", "tertiary"],
            10,
            9,
          ],
          18,
          [
            "match",
            ["get", "class"],
            ["motorway", "trunk", "primary", "secondary", "tertiary"],
            16,
            14,
          ],
        ],
        "text-max-angle": 30,
        "text-font": ["DIN Pro Regular", "Arial Unicode MS Regular"],
        "symbol-placement": "line",
        "text-padding": 1,
        "text-rotation-alignment": "map",
        "text-pitch-alignment": "viewport",
        "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
        "text-letter-spacing": 0.01,
      },
      paint: {
        "text-color": "#fff",
        "text-halo-color": "#000",
        "text-halo-width": 1,
      },
    },
  },
};

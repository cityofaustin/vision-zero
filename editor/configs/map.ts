import "mapbox-gl/dist/mapbox-gl.css";
import { SymbolLayerSpecification, RasterLayerSpecification } from "mapbox-gl";

// The Nearmap API key is managed by CTM. Contact help desk for maintenance and troubleshooting.
const NEARMAP_KEY = process.env.NEXT_PUBLIC_NEARMAP_KEY;
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export const MAP_COORDINATE_PRECISION = 8;

export const DEFAULT_MAP_PAN_ZOOM = {
  latitude: 30.2747,
  longitude: -97.7406,
  zoom: 17,
};

export const MAP_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-99, 29],
  [-96, 32],
];

/** Different basemap style options */
export const mapStyleOptions = {
  darkStreets: "mapbox://styles/mapbox/dark-v11",
  lightStreets: "mapbox://styles/mapbox/light-v11",
  aerial: "mapbox://styles/mapbox/satellite-streets-v12",
};

export const DEFAULT_MAP_PARAMS = {
  touchPitch: false,
  dragRotate: false,
  boxZoom: false,
  mapboxAccessToken: MAPBOX_TOKEN,
  maxBounds: MAP_MAX_BOUNDS,
  mapStyle: "mapbox://styles/mapbox/satellite-streets-v12",
};

interface Layers {
  aerials: RasterLayerSpecification;
  streetLabels: SymbolLayerSpecification;
}

const LAYERS: Layers = {
  aerials: {
    id: "simple-tiles",
    type: "raster",
    source: "raster-tiles",
  },
  streetLabels: {
    // borrowed from mapbox mapbox streets v11 style
    id: "street-labels",
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
};

export const LOCATION_MAP_CONFIG = {
  mapStyle: "mapbox://styles/mapbox/satellite-streets-v11",
  sources: {
    aerials: {
      id: "raster-tiles",
      type: "raster",
      tiles: [
        `https://api.nearmap.com/tiles/v3/Vert/{z}/{x}/{y}.jpg?apikey=${NEARMAP_KEY}`,
      ],
      tileSize: 256,
    },
  },
  layers: LAYERS,
};

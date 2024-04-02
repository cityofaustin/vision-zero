import React from "react";
import { Source, Layer } from "react-map-gl";
import { isDev } from "./environment";
import { colors } from "../styles/colors";

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
// This API key is managed by CTM. Contact help desk for maintenance and troubleshooting.
const NEARMAP_KEY = process.env.REACT_APP_NEARMAP_KEY;

export const defaultInitialState = {
  latitude: 30.2747,
  longitude: -97.7406,
  zoom: 17,
};

export const mapParameters = {
  touchPitch: false,
  dragRotate: false,
  boxZoom: false,
  maxBounds: [[-99, 29], [-96, 32]],
  mapboxAccessToken: TOKEN,
  mapStyle: "mapbox://styles/mapbox/satellite-streets-v11",
};

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

const mockGeoJSON = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [[[-99, 29], [-96, 29], [-96, 32], [-99, 32], [-99, 29]]],
  },
};

const mockPolygonDataLayer = {
  id: "test-location-polygon",
  type: "fill",
  paint: {
    "fill-color": colors.primary,
    "fill-opacity": 0.3, // values 0 to 1
  },
};

/** Source and layer to display NearMap aerials with street labels on top.
 * Localhost and deploy preview URLs are not on the NearMap tile API key allow list.
 * To test locally, this returns a mock layer to test the layer ordering.
 * Adjust the opacity in the mockPolygonDataLayer paint object for further testing.
 * @param {string} beforeId - layer id to place these layers before
 * @param {boolean} showMockLayerLocally - show mock layer locally instead of NearMap tile layer
 */
export const LabeledAerialSourceAndLayer = ({
  beforeId,
  showMockLayerLocally = false,
}) => {
  return isDev && showMockLayerLocally ? (
    <>
      <Source type="geojson" data={mockGeoJSON}>
        <Layer beforeId={beforeId} {...mockPolygonDataLayer} />
      </Source>
    </>
  ) : (
    <>
      <Source {...LOCATION_MAP_CONFIG.sources.aerials} />
      <Layer
        id="street-labels"
        beforeId={beforeId}
        {...LOCATION_MAP_CONFIG.layers.streetLabels}
      />
      <Layer beforeId="street-labels" {...LOCATION_MAP_CONFIG.layers.aerials} />
    </>
  );
};

/**
 * Shorten a coordinate to 6 decimal places
 * @param {string|number} coordinate - latitude or longitude
 * @returns {string} - truncated coordinate
 */
export const truncateCoordinate = coordinate =>
  parseFloat(coordinate).toFixed(6);

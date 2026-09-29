import React from "react";
import { Source, Layer } from "react-map-gl/mapbox";
import { colors } from "../../constants/colors";

const travisCountyBboxGeoJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        kind: "county",
        name: "Travis",
        state: "TX",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          // Outer ring: the whole world (clamped to Mercator-safe latitudes)
          [
            [-180, 85],
            [180, 85],
            [180, -85],
            [-180, -85],
            [-180, 85],
          ],
          // Hole: Travis County bbox
          [
            [-98.1708, 30.0226],
            [-97.3711, 30.0226],
            [-97.3711, 30.6251],
            [-98.1708, 30.6251],
            [-98.1708, 30.0226],
          ],
        ],
      },
    },
  ],
};

const travisCountyDataLayer = {
  id: "travis-county-bbox",
  type: "fill",
  paint: {
    "fill-opacity": 0.15,
    "fill-color": colors.dark,
  },
};

export default function TravisCountyBboxLayer({ beforeId }) {
  return (
    <Source id="travis-source" type="geojson" data={travisCountyBboxGeoJSON}>
      <Layer beforeId={beforeId} {...travisCountyDataLayer} />
    </Source>
  );
}

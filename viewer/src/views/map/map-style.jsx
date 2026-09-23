import React from "react";
import { Source, Layer } from "react-map-gl/mapbox";
import { colors } from "../../constants/colors";

// Empty source and layer placeholder to place other layers beneath road labels
export const baseSourceAndLayer = (
  <Source
    id="base-source"
    type="geojson"
    data={{ type: "FeatureCollection", features: [] }}
  >
    <Layer id="base-layer" {...{ type: "symbol", source: "base-source" }} />
  </Source>
);

// For more information on data-driven styles, see https://www.mapbox.com/help/gl-dds-ref/
// To create white border, add second layer with larger white radius behind primary circles
const crashPointRadius = {
  stops: [
    [8, 2],
    [12, 4],
    [14, 8],
    [16, 10],
  ],
};

const crashPointOutlineRadius = {
  stops: crashPointRadius.stops.map((stop) => [stop[0], stop[1] + 1]),
};

export const fatalitiesDataLayer = {
  id: "fatalities",
  type: "circle",
  paint: {
    "circle-radius": crashPointRadius,
    "circle-color": colors.fatalities,
  },
};

export const fatalitiesOutlineDataLayer = {
  ...fatalitiesDataLayer,
  id: "fatalitiesOutline",
  paint: {
    ...fatalitiesDataLayer.paint,
    "circle-radius": crashPointOutlineRadius,
    "circle-color": colors.white,
  },
};

export const seriousInjuriesDataLayer = {
  id: "seriousInjuries",
  type: "circle",
  paint: {
    "circle-radius": crashPointRadius,
    "circle-color": colors.seriousInjuries,
  },
};

export const seriousInjuriesOutlineDataLayer = {
  ...seriousInjuriesDataLayer,
  id: "seriousInjuriesOutline",
  paint: {
    ...seriousInjuriesDataLayer.paint,
    "circle-radius": crashPointOutlineRadius,
    "circle-color": colors.white,
  },
};

// Map Overlay configuration
// Hide/show based on overlay state, add layers only once and let state determine visibility
// Using state in any other config parameters will cause layer to add again and break map layer

// Style geojson returned from ArcGIS that populates the Source and Layer in Map component
export const cityCouncilDataLayer = {
  id: "cityCouncil",
  type: "fill",
  paint: {
    "fill-opacity": 0.25,
    "fill-color": [
      "match",
      ["get", "COUNCIL_DISTRICT"],
      1,
      colors.mapCityCouncil1,
      2,
      colors.mapCityCouncil2,
      3,
      colors.mapCityCouncil3,
      4,
      colors.mapCityCouncil4,
      5,
      colors.mapCityCouncil5,
      6,
      colors.mapCityCouncil6,
      7,
      colors.mapCityCouncil7,
      8,
      colors.mapCityCouncil8,
      9,
      colors.mapCityCouncil9,
      10,
      colors.mapCityCouncil10,
      /* other */ "#ccc",
    ],
  },
};

// Renders the user-drawn polygon filter once mapbox-gl-draw has finished
// drawing it and its control has been detached from the map (see
// MapPolygonFilter.jsx) - colors match mapbox-gl-draw's default theme.
export const selectedPolygonDataLayer = {
  id: "selectedPolygon",
  type: "fill",
  paint: {
    "fill-color": "#3bb2d0",
    "fill-opacity": 0.1,
  },
};

export const selectedPolygonOutlineDataLayer = {
  id: "selectedPolygonOutline",
  type: "line",
  layout: {
    "line-cap": "round",
    "line-join": "round",
  },
  paint: {
    "line-color": "#3bb2d0",
    "line-width": 2,
  },
};

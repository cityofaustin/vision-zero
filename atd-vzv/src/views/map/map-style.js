import React from "react";
import { Layer } from "react-map-gl";
import { colors } from "../../constants/colors";

// For more information on data-driven styles, see https://www.mapbox.com/help/gl-dds-ref/
export const crashDataLayer = {
  id: "crashes",
  type: "circle",
  paint: {
    "circle-radius": 5,
    "circle-color": `${colors.info}`,
  },
};

// Config ASMP Street Level layers
export const asmpConfig = {
  asmp_1: {
    filter: 0,
    color: colors.mapAsmp1,
  },
  asmp_2: {
    filter: 1,
    color: colors.mapAsmp2,
  },
  asmp_3: {
    filter: 2,
    color: colors.mapAsmp3,
  },
  asmp_4: {
    filter: 3,
    color: colors.mapAsmp4,
  },
  asmp_5: {
    filter: 4,
    color: colors.mapAsmp5,
  },
};

// Map Overlay configuration
// Hide/show based on overlay state, add layers only once and let state determine visibility
// Using state in any other config parameters will cause layer to add again and break map layer

// Build Mapbox GL layers for each ASMP Street Level in config
export const buildAsmpLayers = (config, overlay) =>
  Object.entries(config).map(([level, parameters], i) => {
    const asmpLevel = level.split("").pop();

    // Set config for each ASMP level layer based on ArcGIS VectorTileServer styles
    // https://tiles.arcgis.com/tiles/0L95CJ0VTaxqcmED/arcgis/rest/services/ASMP_Streets_VectorTile/VectorTileServer/resources/styles/root.json?f=pjson
    const asmpLayerConfig = {
      id: level,
      type: "line",
      source: {
        type: "vector",
        tiles: [
          "https://tiles.arcgis.com/tiles/0L95CJ0VTaxqcmED/arcgis/rest/services/ASMP_Streets_VectorTile/VectorTileServer/tile/{z}/{y}/{x}.pbf",
        ],
      },
      "source-layer": "asmp_street_network",
      filter: ["==", "_symbol", parameters.filter],
      layout: {
        "line-cap": "round",
        "line-join": "round",
        visibility: `${
          overlay.options && overlay.options.includes(asmpLevel)
            ? "visible"
            : "none"
        }`,
      },
      paint: {
        "line-color": parameters.color,
        "line-width": 2,
      },
    };

    // Return a Layer component with config prop passed for each level
    return <Layer key={i} {...asmpLayerConfig} />;
  });

// Build Mapbox GL layer High Injury Network
export const buildHighInjuryLayer = (overlay) => {
  // Set config for each ASMP level layer based on ArcGIS VectorTileServer styles
  const overlayId = "highInjury";

  // https://tiles.arcgis.com/tiles/0L95CJ0VTaxqcmED/arcgis/rest/services/HIN_Vector_Tile/VectorTileServer/resources/styles/root.json?f=pjson
  const highInjuryLayerConfig = {
    id: overlayId,
    type: "line",
    source: {
      type: "vector",
      tiles: [
        "https://tiles.arcgis.com/tiles/0L95CJ0VTaxqcmED/arcgis/rest/services/HIN_Vector_Tile/VectorTileServer/tile/{z}/{y}/{x}.pbf",
      ],
    },
    "source-layer": "High-Injury Network",
    layout: {
      "line-join": "round",
      visibility: `${overlay.name === overlayId ? "visible" : "none"}`,
    },
    paint: {
      "line-color": colors.mapHighInjuryNetwork,
      "line-width": 2,
    },
  };

  // Return a Layer component with config prop passed
  return <Layer key={"highInjury"} {...highInjuryLayerConfig} />;
};

// Style geojson returned from ArcGIS that populates the Source and Layer in Map component
// https://services.arcgis.com/0L95CJ0VTaxqcmED/arcgis/rest/services/BOUNDARIES_single_member_districts/FeatureServer/0?f=pjson
export const cityCouncilDataLayer = {
  id: "data",
  type: "fill",
  paint: {
    "fill-color": {
      property: "COUNCIL_DISTRICT",
      stops: [
        [1, colors.mapCityCouncil1],
        [2, colors.mapCityCouncil2],
        [3, colors.mapCityCouncil3],
        [4, colors.mapCityCouncil4],
        [5, colors.mapCityCouncil5],
        [6, colors.mapCityCouncil6],
        [7, colors.mapCityCouncil7],
        [8, colors.mapCityCouncil8],
        [9, colors.mapCityCouncil9],
        [10, colors.mapCityCouncil10],
      ],
    },
    "fill-opacity": 0.5,
  },
};

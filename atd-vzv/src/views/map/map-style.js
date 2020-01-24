import React from "react";
import { Layer } from "react-map-gl";
import { colors } from "../../constants/colors";

// For more information on data-driven styles, see https://www.mapbox.com/help/gl-dds-ref/
export const crashDataLayer = {
  id: "crashes",
  type: "circle",
  paint: {
    "circle-radius": 5,
    "circle-color": `${colors.info}`
  }
};

// Config ASMP Street Level layers
export const asmpConfig = {
  asmp_1: {
    filter: 0,
    color: colors.mapAsmp1
  },
  asmp_2: {
    filter: 1,
    color: colors.mapAsmp2
  },
  asmp_3: {
    filter: 2,
    color: colors.mapAsmp3
  },
  asmp_4: {
    filter: 3,
    color: colors.mapAsmp4
  },
  asmp_5: {
    filter: 4,
    color: colors.mapAsmp5
  }
};

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
          "https://tiles.arcgis.com/tiles/0L95CJ0VTaxqcmED/arcgis/rest/services/ASMP_Streets_VectorTile/VectorTileServer/tile/{z}/{y}/{x}.pbf"
        ]
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
        }`
      },
      paint: {
        "line-color": parameters.color,
        "line-width": 2
      }
    };

    // Return a Layer component with config prop passed for each level
    return <Layer key={i} {...asmpLayerConfig} />;
  });

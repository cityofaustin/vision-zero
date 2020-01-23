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
    color: "#F9AE91"
  },
  asmp_2: {
    filter: 1,
    color: "#F66A4A"
  },
  asmp_3: {
    filter: 2,
    color: "#E60000"
  },
  asmp_4: {
    filter: 3,
    color: "#A50F15"
  },
  asmp_5: {
    filter: 4,
    color: "#1B519D"
  }
};

// Build Mapbox GL layers for each ASMP Street Level in config
export const buildAsmpLayers = (config, overlay) =>
  Object.entries(config).map(([level, parameters], i) => {
    const asmpLevel = level.split("").pop();

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

    return <Layer key={i} {...asmpLayerConfig} />;
  });

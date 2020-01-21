import { colors } from "../../constants/colors";

// For more information on data-driven styles, see https://www.mapbox.com/help/gl-dds-ref/
export const crashDataLayer = {
  id: "data",
  type: "circle",
  paint: {
    "circle-radius": 5,
    "circle-color": `${colors.info}`
  }
};

export const asmpDataLayer = {
  id: "data",
  type: "line",
  paint: {
    "line-width": 3,
    // "line-color": `${colors.info}`
    "line-color": [
      "interpolate",
      ["linear"],
      // "match", ["string", ["get", ""]],
      ["get", "STREET_LEVEL"],
      0,
      colors.warning,
      1,
      colors.redGradient2Of5,
      2,
      colors.chartOrange,
      3,
      colors.chartRedOrange,
      4,
      colors.chartRed,
      5,
      colors.chartBlue
    ]
  }
};

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

export const asmpDataLayer = {
  id: "asmp",
  type: "line",
  paint: {
    "line-width": 3,
    "line-color": [
      "interpolate",
      ["linear"],
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

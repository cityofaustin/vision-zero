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

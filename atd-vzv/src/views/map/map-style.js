import { colors } from "../../constants/colors";

const MAX_ZOOM_LEVEL = 9;

// For more information on data-driven styles, see https://www.mapbox.com/help/gl-dds-ref/
export const dataLayer = {
  id: "data",
  type: "circle",
  paint: {
    "circle-radius": 5,
    "circle-color": `${colors.info}`
  }
};

export const heatmapLayer = {
  //   maxzoom: MAX_ZOOM_LEVEL,
  type: "heatmap",
  paint: {
    // Increase the heatmap weight based on number of fatalities
    "heatmap-weight": [
      "interpolate",
      ["linear"],
      ["get", "deathCount"],
      0,
      0,
      1,
      0.5,
      2,
      0.7,
      3,
      0.9,
      4,
      1
    ],
    // Increase the heatmap color weight weight by zoom level
    // heatmap-intensity is a multiplier on top of heatmap-weight
    "heatmap-intensity": [
      "interpolate",
      ["linear"],
      ["zoom"],
      0,
      3,
      5,
      MAX_ZOOM_LEVEL
    ],
    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
    // Begin color ramp at 0-stop with a 0-transparancy color
    // to create a blur-like effect.
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      "rgba(33,102,172,0)",
      0.2,
      "rgb(103,169,207)",
      0.4,
      "rgb(209,229,240)",
      0.6,
      "rgb(253,219,199)",
      0.8,
      "rgb(239,138,98)",
      0.9,
      "rgb(255,201,101)"
    ],
    // Adjust the heatmap radius by zoom level
    "heatmap-radius": [
      "interpolate",
      ["linear"],
      ["zoom"],
      0,
      2,
      5,
      MAX_ZOOM_LEVEL
    ],
    // Transition from heatmap to circle layer by zoom level
    "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 1, 9, 1]
  }
};

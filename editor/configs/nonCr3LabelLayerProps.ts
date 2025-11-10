import { LayerProps } from "react-map-gl";

export const nonCr3LabelLayerProps: LayerProps = {
  id: "non-cr3-points-labels",
  type: "symbol",
  layout: {
    "text-field": ["concat", "", ["get", "case_id"]],
    "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
    "text-size": 14,
    "text-offset": [0, 1.5], // offset below the circle
    "text-anchor": "top",
    "text-allow-overlap": false, // prevents label collisions
  },
  paint: {
    "text-color": "#6b7676",
    "text-halo-color": "#fff",
    "text-halo-width": 1.5,
  },
};

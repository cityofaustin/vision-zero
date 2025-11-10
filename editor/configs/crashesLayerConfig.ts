import { LayerProps } from "react-map-gl";

export const crashesLabelLayerProps: LayerProps = {
  id: "crash-points-labels",
  type: "symbol",
  layout: {
    // "text-field": ["concat", "CR3 ", ["get", "record_locator"]],
    "text-field": ["get", "record_locator"],
    "text-font": ["Arial Unicode MS Bold"],
    "text-size": 18,
    "text-offset": [0, 1.5], // offset below the circle
    "text-anchor": "top",
    "text-allow-overlap": false, // prevents label collisions
  },
  paint: {
    "text-color": "#1276d1",
    "text-halo-color": "#fff",
    "text-halo-width": 1.5,
  },
};

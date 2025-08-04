import { Source, Layer } from "react-map-gl";
import { LOCATION_MAP_CONFIG } from "@/configs/map";
import "mapbox-gl/dist/mapbox-gl.css";

/**
 * Source and layer to display NearMap aerials with street labels on top
 */
export const CustomDataSourceAndLayer = ({
  beforeId,
}: {
  beforeId?: string;
}) => {
  return (
    <>
      <Source {...LOCATION_MAP_CONFIG.sources.aerials} />
      <Layer beforeId={beforeId} {...LOCATION_MAP_CONFIG.layers.streetLabels} />
      <Layer beforeId="street-labels" {...LOCATION_MAP_CONFIG.layers.aerials} />
    </>
  );
};

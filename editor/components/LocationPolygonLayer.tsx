import { useMemo } from "react";
import { Layer, Source } from "react-map-gl";
import { Location } from "@/types/locations";
import { useRegisterMapFeatures } from "@/contexts/MapFeatureRegistry";
import { LineLayerSpecification } from "mapbox-gl";
import { Feature, GeoJsonProperties, MultiPolygon } from "geojson";
import { feature } from "@turf/helpers";

interface LocationPolygonLayerProps {
  location: Location;
}

const polygonLayer: LineLayerSpecification = {
  id: "location-polygon",
  source: "location-polygon",
  type: "line",
  paint: {
    "line-color": "orange",
    "line-width": 4,
  },
};

export const useLocationFeature = (
  location: Location | null
): Feature<MultiPolygon, GeoJsonProperties> | null =>
  useMemo(() => {
    if (!location) {
      return null;
    }
    const { geometry, ...properties } = location;
    return feature(geometry, properties);
  }, [location]);

/**
 * Location polygon geojson layer with built-in feature registration
 */
export default function LocationPolygonLayer({
  location,
}: LocationPolygonLayerProps) {
  const polygonFeature = useLocationFeature(location);

  useRegisterMapFeatures(
    "locationPolygon",
    polygonFeature ? [polygonFeature] : null
  );

  if (!polygonFeature) {
    return null;
  }
  return (
    <Source type="geojson" data={polygonFeature} id="location-polygon">
      <Layer {...polygonLayer} />
    </Source>
  );
}

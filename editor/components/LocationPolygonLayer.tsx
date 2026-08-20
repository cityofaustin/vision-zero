import { useMemo } from "react";
import { Layer, Source } from "react-map-gl";
import { Location } from "@/types/locations";
import { useRegisterMapFeature } from "@/contexts/MapFeatureRegistry";
import { FillLayerSpecification, LineLayerSpecification } from "mapbox-gl";
import { Feature, GeoJsonProperties, MultiPolygon } from "geojson";
import { feature } from "@turf/helpers";
import { COLORS } from "@/utils/constants";

interface LocationPolygonLayerProps {
  location: Location;
}

const polygonLayerLine: LineLayerSpecification = {
  id: "location-polygon-line",
  source: "location-polygon",
  type: "line",
  paint: {
    "line-color": COLORS.locationPolygonOrange,
    "line-width": 3,
  },
};

const polygonLayerOutline: LineLayerSpecification = {
  id: "location-polygon-outline",
  source: "location-polygon",
  type: "line",
  paint: {
    "line-color": "#000",
    "line-width": 4,
  },
};

const polygonLayerFill: FillLayerSpecification = {
  id: "location-polygon-fill",
  source: "location-polygon",
  type: "fill",
  paint: {
    "fill-color": COLORS.locationPolygonOrange,
    "fill-opacity": 0.1,
  },
};

/**
 * Converts a `Location` record into a `MultiPolygon` feature
 */
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

  useRegisterMapFeature("locationPolygon", polygonFeature);

  if (!polygonFeature) {
    return null;
  }
  return (
    <Source type="geojson" data={polygonFeature} id="location-polygon">
      <Layer {...polygonLayerFill} />
      <Layer {...polygonLayerOutline} />
      <Layer {...polygonLayerLine} />
    </Source>
  );
}

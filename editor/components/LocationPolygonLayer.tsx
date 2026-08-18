import { useMemo } from "react";
import { Layer, Source } from "react-map-gl";
import { Location } from "@/types/locations";
import { useRegisterMapFeatures } from "@/contexts/MapFeatureRegistry";
import { FillLayerSpecification, LineLayerSpecification } from "mapbox-gl";
import { Feature, GeoJsonProperties, MultiPolygon } from "geojson";
import { feature } from "@turf/helpers";

interface LocationPolygonLayerProps {
  location: Location;
}

const polygonLayer3: LineLayerSpecification = {
  id: "location-polygon",
  source: "location-polygon",
  type: "line",
  paint: {
    "line-color": "orange",
    "line-width": 3,
  },
};

const polygonLayer2: LineLayerSpecification = {
  id: "location-polygon-2",
  source: "location-polygon",
  type: "line",
  paint: {
    "line-color": "black",
    "line-width": 4,
  },
};

const polygonLayer: FillLayerSpecification = {
  id: "location-polygon-fill",
  source: "location-polygon",
  type: "fill",
  paint: {
    "fill-color": "orange",
    "fill-opacity": 0.1,
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
      <Layer {...polygonLayer2} />
      <Layer {...polygonLayer3} />
    </Source>
  );
}

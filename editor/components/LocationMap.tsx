import { useMemo, RefObject } from "react";
import MapGL, {
  FullscreenControl,
  NavigationControl,
  MapRef,
} from "react-map-gl";
import { center } from "@turf/center";
import { DEFAULT_MAP_PAN_ZOOM, DEFAULT_MAP_PARAMS } from "@/configs/map";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapAerialSourceAndLayer } from "./MapAerialSourceAndLayer";
import MapBasemapControl from "@/components/MapBasemapControl";
import { useBasemap } from "@/utils/map";
import { Location } from "@/types/locations";
import LocationPolygonLayer from "@/components/LocationPolygonLayer";

interface LocationMapProps {
  /**
   * Ref object which will hold the mapbox instance
   */
  mapRef: RefObject<MapRef | null>;
  location: Location;
}

/**
 * Map component which renders an editable point marker
 */
export const LocationMap = ({ mapRef, location }: LocationMapProps) => {
  const centerFeature = useMemo(() => {
    if (!location.geometry) {
      return;
    }
    return center(location.geometry);
  }, [location]);

  const { basemapURL, basemapType, setBasemapType } = useBasemap("aerial");

  if (!centerFeature) {
    return null;
  }

  return (
    <MapGL
      ref={mapRef}
      initialViewState={{
        latitude: Number(centerFeature.geometry.coordinates[1]),
        longitude: Number(centerFeature.geometry.coordinates[0]),
        zoom: DEFAULT_MAP_PAN_ZOOM.zoom,
      }}
      {...DEFAULT_MAP_PARAMS}
      mapStyle={basemapURL}
      cooperativeGestures={true}
      // Resize the map canvas when parent row expands to fit crash
      onLoad={(e) => e.target.resize()}
      maxZoom={21}
    >
      <FullscreenControl position="top-left" />
      <NavigationControl position="top-left" showCompass={false} />
      <MapBasemapControl
        basemapType={basemapType}
        setBasemapType={setBasemapType}
        controlId="locationMap"
      />
      {basemapType === "aerial" && <MapAerialSourceAndLayer />}
      <LocationPolygonLayer location={location} />
    </MapGL>
  );
};

import { useRef } from "react";
import MapGL, {
  FullscreenControl,
  NavigationControl,
  MapRef,
  Marker,
} from "react-map-gl";
import { DEFAULT_MAP_PAN_ZOOM, DEFAULT_MAP_PARAMS } from "@/configs/map";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapAerialSourceAndLayer } from "./MapAerialSourceAndLayer";
import { MultiPolygon } from "@/types/geojson";

interface LocationMapProps {
  polygon: MultiPolygon;
}

/**
 * Map component which renders an editable point marker
 */
export const LocationMap = ({ polygon }: LocationMapProps) => {
  const mapRef = useRef<MapRef | null>(null);

  console.log("REF", mapRef);
  return (
    <MapGL
      ref={mapRef}
      initialViewState={{
        latitude: DEFAULT_MAP_PAN_ZOOM.latitude,
        longitude: DEFAULT_MAP_PAN_ZOOM.longitude,
        zoom: DEFAULT_MAP_PAN_ZOOM.zoom,
      }}
      {...DEFAULT_MAP_PARAMS}
      cooperativeGestures={true}
      // Resize the map canvas when parent row expands to fit crash
      onLoad={(e) => e.target.resize()}
      maxZoom={21}
    >
      <FullscreenControl position="top-left" />
      <NavigationControl position="top-left" showCompass={false} />
      {/* add nearmap raster source and style */}
      <MapAerialSourceAndLayer />
    </MapGL>
  );
};

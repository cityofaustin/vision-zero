import {
  useCallback,
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import MapGL, {
  FullscreenControl,
  NavigationControl,
  Marker,
  ViewStateChangeEvent,
  MapRef,
} from "react-map-gl";
import { DEFAULT_MAP_PAN_ZOOM, DEFAULT_MAP_PARAMS } from "@/configs/map";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapAerialSourceAndLayer } from "./MapAerialSourceAndLayer";
import { COLORS } from "@/utils/constants";

export interface LatLon {
  latitude: number | null;
  longitude: number | null;
}

interface CrashMapProps {
  /**
   * The initial latitude - used when not editing
   */
  savedLatitude: number | null;
  /**
   * The initial longitude - used when not editing
   */
  savedLongitude: number | null;
  /**
   * If the map is in edit mode
   */
  isEditing: boolean;
  /**
   * The lat/lon coordinates that are saved while editing
   */
  editCoordinates: LatLon;
  setEditCoordinates: Dispatch<SetStateAction<LatLon>>;
}

/**
 * Map component which renders an editable point marker
 */
export const CrashMap = ({
  savedLatitude,
  savedLongitude,
  isEditing,
  editCoordinates,
  setEditCoordinates,
}: CrashMapProps) => {
  const mapRef = useRef<MapRef | null>(null);

  const onDrag = useCallback(
    (e: ViewStateChangeEvent) => {
      const latitude = e.viewState.latitude;
      const longitude = e.viewState.longitude;
      setEditCoordinates({ latitude, longitude });
    },
    [setEditCoordinates]
  );

  useEffect(() => {
    if (!isEditing) {
      // reset marker coords
      setEditCoordinates({
        latitude: savedLatitude,
        longitude: savedLongitude,
      });
    }
  }, [isEditing, setEditCoordinates, savedLatitude, savedLongitude]);
  return (
    <MapGL
      ref={mapRef}
      initialViewState={{
        latitude: savedLatitude || DEFAULT_MAP_PAN_ZOOM.latitude,
        longitude: savedLongitude || DEFAULT_MAP_PAN_ZOOM.longitude,
        zoom: DEFAULT_MAP_PAN_ZOOM.zoom,
      }}
      {...DEFAULT_MAP_PARAMS}
      cooperativeGestures={true}
      // Resize the map canvas when parent row expands to fit crash
      onLoad={(e) => e.target.resize()}
      onDrag={isEditing ? onDrag : undefined}
      maxZoom={21}
    >
      <FullscreenControl position="top-left" />
      <NavigationControl position="top-left" showCompass={false} />
      {savedLatitude && savedLongitude && !isEditing && (
        <Marker
          latitude={savedLatitude}
          longitude={savedLongitude}
          color={COLORS.primary}
        ></Marker>
      )}
      {isEditing && (
        <Marker
          latitude={editCoordinates.latitude || 0}
          longitude={editCoordinates.longitude || 0}
          color={isEditing ? COLORS.danger : undefined}
        />
      )}
      {/* add nearmap raster source and style */}
      <MapAerialSourceAndLayer />
    </MapGL>
  );
};

import {
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
  MutableRefObject,
} from "react";
import MapGL, {
  FullscreenControl,
  NavigationControl,
  Marker,
  ViewStateChangeEvent,
  MapRef,
} from "react-map-gl";
import {
  DEFAULT_MAP_PAN_ZOOM,
  DEFAULT_MAP_PARAMS,
  MAP_COORDINATE_PRECISION,
  MAP_MAX_BOUNDS,
} from "@/configs/map";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapAerialSourceAndLayer } from "./MapAerialSourceAndLayer";
import { COLORS } from "@/utils/constants";
import { z, ZodFormattedError } from "zod";

export interface LatLon {
  latitude: number;
  longitude: number;
}

export interface LatLonString {
  latitude: string;
  longitude: string;
}

export const LatLonSchema = z.object({
  latitude: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(MAP_MAX_BOUNDS[0][1], { message: "Latitude is out of bounds" })
    .max(MAP_MAX_BOUNDS[1][1], { message: "Latitude is out of bounds" }),
  longitude: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(MAP_MAX_BOUNDS[0][0], { message: "Longitude is out of bounds" })
    .max(MAP_MAX_BOUNDS[1][0], { message: "Longitude is out of bounds" }),
});

export type CoordinateValidationError = ZodFormattedError<LatLon>;

interface CrashMapProps {
  /**
   * Ref object which will hold the mapbox instance
   */
  mapRef: MutableRefObject<MapRef | null>;
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
  mapLatLon: LatLon;
  setMapLatLon: Dispatch<SetStateAction<LatLon>>;
}

/**
 * Map component which renders an editable point marker
 */
export const CrashMap = ({
  mapRef,
  savedLatitude,
  savedLongitude,
  isEditing,
  mapLatLon,
  setMapLatLon,
}: CrashMapProps) => {
  const onDrag = useCallback(
    (e: ViewStateChangeEvent) => {
      // truncate values to our preferred precision
      const latitude = +e.viewState.latitude.toFixed(MAP_COORDINATE_PRECISION);
      const longitude = +e.viewState.longitude.toFixed(
        MAP_COORDINATE_PRECISION
      );
      setMapLatLon({
        latitude,
        longitude,
      });
    },
    [setMapLatLon]
  );

  useEffect(() => {
    if (!isEditing) {
      // initialize edit coordiantes and reset them after saving
      setMapLatLon({
        latitude: savedLatitude || DEFAULT_MAP_PAN_ZOOM.latitude,
        longitude: savedLongitude || DEFAULT_MAP_PAN_ZOOM.longitude,
      });
    }
  }, [isEditing, setMapLatLon, savedLatitude, savedLongitude]);

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
          latitude={mapLatLon.latitude}
          longitude={mapLatLon.longitude}
          color={isEditing ? COLORS.danger : undefined}
        />
      )}
      {/* add nearmap raster source and style */}
      <MapAerialSourceAndLayer />
    </MapGL>
  );
};

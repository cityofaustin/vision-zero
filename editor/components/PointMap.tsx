import {
  ComponentType,
  useCallback,
  useEffect,
  useMemo,
  Dispatch,
  SetStateAction,
  MutableRefObject,
  ReactNode,
} from "react";
import MapGL, {
  FullscreenControl,
  NavigationControl,
  Marker as MapboxMarker,
  ViewStateChangeEvent,
  MapRef,
  MarkerProps,
} from "react-map-gl";
import MapGeocoderControl from "@/components/MapGeocoderControl";
import {
  DEFAULT_MAP_PAN_ZOOM,
  DEFAULT_MAP_PARAMS,
  MAP_COORDINATE_PRECISION,
  MAP_MAX_BOUNDS,
} from "@/configs/map";
import { useBasemap, useCurrentBounds } from "@/utils/map";
import MapBasemapControl, {
  CustomLayerToggle,
} from "@/components/MapBasemapControl";
import MapFitBoundsControl from "./MapFitBoundsControl";
import { COLORS } from "@/utils/constants";
import { z, ZodFormattedError } from "zod";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapAerialSourceAndLayer } from "@/components/MapAerialSourceAndLayer";

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
    .min(MAP_MAX_BOUNDS[0][1], { message: "Out of bounds" })
    .max(MAP_MAX_BOUNDS[1][1], { message: "Out of bounds" }),
  longitude: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .min(MAP_MAX_BOUNDS[0][0], { message: "Out of bounds" })
    .max(MAP_MAX_BOUNDS[1][0], { message: "Out of bounds" }),
});

export type CoordinateValidationError = ZodFormattedError<LatLon>;

interface PointMapProps {
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
  isEditing?: boolean;
  /**
   * The lat/lon coordinates that are saved while editing
   */
  mapLatLon?: LatLon;
  setMapLatLon?: Dispatch<SetStateAction<LatLon>>;
  /**
   * Optional custom Marker component to use as the marker.
   */
  CustomMarker?: ComponentType<MarkerProps> | null;
  /**
   * Additional layers, markers, or any other elements to be
   * rendered on the map
   */
  children?: ReactNode;
  /**
   * Configs for adding custom layer toggles to the basemap control
   */
  customLayerToggles?: CustomLayerToggle[];
}

/**
 * Map component which renders a point marker, may be editable
 */
export const PointMap = ({
  mapRef,
  savedLatitude,
  savedLongitude,
  isEditing,
  mapLatLon,
  setMapLatLon,
  CustomMarker,
  children,
  customLayerToggles,
}: PointMapProps) => {
  const { basemapURL, basemapType, setBasemapType } = useBasemap("aerial");

  const geojsonBounds = useCurrentBounds({
    type: "Point",
    coordinates:
      savedLatitude && savedLongitude ? [savedLongitude, savedLatitude] : [],
  });

  const onDrag = useCallback(
    (e: ViewStateChangeEvent) => {
      // truncate values to our preferred precision
      const latitude = +e.viewState.latitude.toFixed(MAP_COORDINATE_PRECISION);
      const longitude = +e.viewState.longitude.toFixed(
        MAP_COORDINATE_PRECISION
      );
      if (setMapLatLon) {
        setMapLatLon({
          latitude,
          longitude,
        });
      }
    },
    [setMapLatLon]
  );

  useEffect(() => {
    if (!isEditing && setMapLatLon) {
      // initialize edit coordinates and reset them after saving
      setMapLatLon({
        latitude: savedLatitude || DEFAULT_MAP_PAN_ZOOM.latitude,
        longitude: savedLongitude || DEFAULT_MAP_PAN_ZOOM.longitude,
      });
    }
  }, [isEditing, setMapLatLon, savedLatitude, savedLongitude]);

  const Marker = CustomMarker ? CustomMarker : MapboxMarker;

  /**
   * Update the key of the marker when children changes - this is a bit
   * of a hack to ensure that the marker is always rendered on top of
   * other map markers
   */
  const dynamicMarkerKey = useMemo(() => {
    if (!children) return "no-children";
    return Date.now();
  }, [children]);

  return (
    <MapGL
      ref={mapRef}
      initialViewState={{
        latitude: savedLatitude || DEFAULT_MAP_PAN_ZOOM.latitude,
        longitude: savedLongitude || DEFAULT_MAP_PAN_ZOOM.longitude,
        zoom: DEFAULT_MAP_PAN_ZOOM.zoom,
      }}
      {...DEFAULT_MAP_PARAMS}
      mapStyle={basemapURL}
      cooperativeGestures={true}
      // Resize the map canvas when parent row expands to fit crash
      onLoad={(e) => e.target.resize()}
      onDrag={isEditing ? onDrag : undefined}
      maxZoom={21}
    >
      {basemapType === "aerial" && <MapAerialSourceAndLayer />}
      <FullscreenControl position="bottom-right" />
      <NavigationControl position="top-right" showCompass={false} />
      <MapFitBoundsControl mapRef={mapRef} bounds={geojsonBounds} />
      {/* add nearmap raster source and style */}
      {basemapType === "aerial" && <MapAerialSourceAndLayer />}
      {setMapLatLon && (
        <MapGeocoderControl
          position="top-left"
          onResult={(latLon: LatLon) => setMapLatLon(latLon)}
        />
      )}
      <MapBasemapControl
        basemapType={basemapType}
        setBasemapType={setBasemapType}
        customLayerToggles={customLayerToggles}
        controlId="pointMap"
      />
      {/* Custom layers */}
      {children}
      {/* editable + not editable point layers */}
      {savedLatitude && savedLongitude && !isEditing && (
        <Marker
          key={dynamicMarkerKey}
          latitude={savedLatitude}
          longitude={savedLongitude}
          color={COLORS.primary}
        />
      )}
      {isEditing && mapLatLon && (
        <Marker
          key={dynamicMarkerKey}
          latitude={mapLatLon.latitude}
          longitude={mapLatLon.longitude}
          color={isEditing ? COLORS.danger : undefined}
        />
      )}
    </MapGL>
  );
};

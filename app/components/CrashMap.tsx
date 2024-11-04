import {
  useCallback,
  useRef,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import MapGL, {
  Source,
  Layer,
  FullscreenControl,
  NavigationControl,
  Marker,
  ViewStateChangeEvent,
  MapRef,
} from "react-map-gl";
import {
  DEFAULT_MAP_PAN_ZOOM,
  DEFAULT_MAP_PARAMS,
  LOCATION_MAP_CONFIG,
} from "@/configs/map";

import { LatLon } from "@/types/types";
import "mapbox-gl/dist/mapbox-gl.css";

/**
 * Source and layer to display NearMap aerials with street labels on top
 */
export const LabeledAerialSourceAndLayer = ({
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

interface CrashMapProps {
  savedLatitude: number | null;
  savedLongitude: number | null;
  isEditing: boolean;
  editCoordinates: LatLon;
  setEditCoordinates: Dispatch<SetStateAction<LatLon>>;
}

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
        <Marker latitude={savedLatitude} longitude={savedLongitude}></Marker>
      )}
      {isEditing && (
        <Marker
          latitude={editCoordinates.latitude || 0}
          longitude={editCoordinates.longitude || 0}
          color={isEditing ? "red" : undefined}
        />
      )}
      {/* add nearmap raster source and style */}
      <LabeledAerialSourceAndLayer />
    </MapGL>
  );
};

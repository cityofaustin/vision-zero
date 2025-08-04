import { useCallback, MutableRefObject } from "react";
import MapGL, {
  FullscreenControl,
  NavigationControl,
  ViewStateChangeEvent,
  MapRef,
  Source,
  Layer,
} from "react-map-gl";
import MapGeocoderControl from "@/components/MapGeocoderControl";
import { DEFAULT_MAP_PAN_ZOOM, DEFAULT_MAP_PARAMS } from "@/configs/map";
import "mapbox-gl/dist/mapbox-gl.css";
import { FeatureCollection } from "geojson";
import { TableMapConfig } from "@/types/tableMapConfig";

export interface LatLon {
  latitude: number;
  longitude: number;
}

export interface LatLonString {
  latitude: string;
  longitude: string;
}

interface TableMapProps {
  /**
   * Ref object which will hold the mapbox instance
   */
  mapRef: MutableRefObject<MapRef | null>;
  /**
   * The data that will be rendered as map features
   */
  geojson: FeatureCollection;
  mapConfig: TableMapConfig;
}

/**
 * Map component which renders an editable point marker
 */
export const TableMap = ({ mapRef, geojson, mapConfig }: TableMapProps) => {
  const onDragEnd = useCallback((e: ViewStateChangeEvent) => {
    // todo: something?
    console.log("drag end", e);
  }, []);

  return (
    <MapGL
      ref={mapRef}
      initialViewState={{
        latitude: DEFAULT_MAP_PAN_ZOOM.latitude,
        longitude: DEFAULT_MAP_PAN_ZOOM.longitude,
        zoom: DEFAULT_MAP_PAN_ZOOM.zoom - 5,
      }}
      {...DEFAULT_MAP_PARAMS}
      cooperativeGestures={true}
      // Resize the map canvas when parent row expands to fit crash
      onLoad={(e) => e.target.resize()}
      onDragEnd={onDragEnd}
      maxZoom={21}
    >
      <FullscreenControl position="bottom-right" />
      <NavigationControl position="top-right" showCompass={false} />

      {/* custom point source and layer from data */}
      {/* Point source and layer from data */}
      <Source id="custom-source" type="geojson" data={geojson}>
        <Layer id="custom-layer" type="circle" {...mapConfig?.layerProps} />
      </Source>

      <MapGeocoderControl position="top-left" />
    </MapGL>
  );
};

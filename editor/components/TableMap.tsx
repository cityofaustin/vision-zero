import { useCallback, MutableRefObject, useMemo, useEffect } from "react";
import MapGL, {
  FullscreenControl,
  NavigationControl,
  ViewStateChangeEvent,
  MapRef,
  Source,
  Layer,
  LayerProps,
} from "react-map-gl";
import Button from "react-bootstrap/Button";
import { FaHome } from "react-icons/fa";
import AlignedLabel from "@/components/AlignedLabel";
import { bbox } from "@turf/bbox";
import { DEFAULT_MAP_PAN_ZOOM, DEFAULT_MAP_PARAMS } from "@/configs/map";
import { FeatureCollection } from "geojson";
import { TableMapConfig } from "@/types/tableMapConfig";

import "mapbox-gl/dist/mapbox-gl.css";
import { LngLatBoundsLike } from "mapbox-gl";
import { FaExpand } from "react-icons/fa6";

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
 * Custom control that fits map to current bounds
 */
function HomeControl({
  mapRef,
  bounds,
}: {
  mapRef: MutableRefObject<MapRef | null>;
  bounds: LngLatBoundsLike | undefined;
}) {
  return (
    <Button
      size="lg"
      className="m-2 px-2 rounded"
      variant="primary"
      style={{
        position: "absolute",
        cursor: "pointer",
      }}
      onClick={() => {
        if (bounds) {
          mapRef?.current?.fitBounds(bounds, { padding: 10 });
        }
      }}
    >
      <AlignedLabel>
        <FaHome className="fs-4" />
      </AlignedLabel>
    </Button>
  );
}

/**
 * Hook which computes the bounding box of the provided geojson
 *
 * Returns undefined if the geojson has no features
 */
const useCurrentBounds = (
  geojson: FeatureCollection
): LngLatBoundsLike | undefined =>
  useMemo(() => {
    if (!geojson.features.length) {
      return undefined;
    }
    const bounds = bbox(geojson);

    return [
      [bounds[0], bounds[1]],
      [bounds[2], bounds[3]],
    ];
  }, [geojson]);

/**
 * Map component which renders an editable point marker
 */
export const TableMap = ({ mapRef, geojson, mapConfig }: TableMapProps) => {
  const geojsonBounds = useCurrentBounds(geojson);

  /**
   * Initialize map based on initial geojson bounds
   */
  const initialViewState = useMemo(() => {
    if (geojsonBounds) {
      return { bounds: geojsonBounds };
    }
    // Fallback when bounds are not available
    return {
      latitude: DEFAULT_MAP_PAN_ZOOM.latitude,
      longitude: DEFAULT_MAP_PAN_ZOOM.longitude,
      zoom: 9,
    };
  }, []);

  useEffect(() => {
    if (geojsonBounds) {
      // update map bounds fit geojson bounds
      mapRef?.current?.fitBounds(geojsonBounds, { padding: 10 });
    }
  }, [geojsonBounds]);

  return (
    <MapGL
      ref={mapRef}
      initialViewState={initialViewState}
      {...DEFAULT_MAP_PARAMS}
      cooperativeGestures={true}
      // Resize the map canvas when parent row expands to fit crash
      onLoad={(e) => e.target.resize()}
      maxZoom={21}
    >
      <FullscreenControl position="bottom-right" />
      <NavigationControl position="top-right" showCompass={false} />

      {/* custom point source and layer from data */}
      {/* Point source and layer from data */}
      <Source id="custom-source" type="geojson" data={geojson}>
        <Layer id="custom-layer" type="circle" {...mapConfig?.layerProps} />
      </Source>
      <HomeControl mapRef={mapRef} bounds={geojsonBounds} />
    </MapGL>
  );
};

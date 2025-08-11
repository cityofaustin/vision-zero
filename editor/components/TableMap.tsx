import { MutableRefObject, useMemo, useEffect, useState } from "react";
import MapGL, {
  FullscreenControl,
  NavigationControl,
  MapRef,
  Source,
  Layer,
} from "react-map-gl";
import Button from "react-bootstrap/Button";
import { FaHome } from "react-icons/fa";
import AlignedLabel from "@/components/AlignedLabel";
import { bbox } from "@turf/bbox";
import { DEFAULT_MAP_PAN_ZOOM, DEFAULT_MAP_PARAMS } from "@/configs/map";
import { FeatureCollection } from "geojson";
import { TableMapConfig } from "@/types/tableMapConfig";
import { LngLatBoundsLike } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

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
   * Initialize map based on initial geojson bounds. Bounds may be
   * undefined if the page was loaded with the map active (because
   * geojson data must be fetched), or the the map may initialize
   * with geojson if the map has been toggled from the list view
   */
  const [initialViewState] = useState(() => {
    if (geojsonBounds) {
      return { bounds: geojsonBounds };
    }
    // Fallback when bounds are not available
    return {
      latitude: DEFAULT_MAP_PAN_ZOOM.latitude,
      longitude: DEFAULT_MAP_PAN_ZOOM.longitude,
      zoom: 9,
    };
  });

  /**
   * After initialization, this hook updates the map extent
   * when data changes
   */
  useEffect(() => {
    if (geojsonBounds) {
      mapRef?.current?.fitBounds(geojsonBounds, { padding: 10 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geojsonBounds]); // mapRef is stable (ref object)

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

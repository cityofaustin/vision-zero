import { MutableRefObject, useEffect, useState, useCallback } from "react";
import MapGL, {
  FullscreenControl,
  NavigationControl,
  MapRef,
  Source,
  Layer,
} from "react-map-gl";
import MapFitBoundsControl from "@/components/MapFitBoundsControl";
import { useCurrentBounds } from "@/utils/map";
import { DEFAULT_MAP_PAN_ZOOM, DEFAULT_MAP_PARAMS } from "@/configs/map";
import { FeatureCollection } from "geojson";
import { TableMapConfig } from "@/types/tableMapConfig";
import "mapbox-gl/dist/mapbox-gl.css";
import { GeoJSONFeature } from "mapbox-gl";
import PopupWrapper from "@/components/PopupWrapper";
import TableMapPopupContent from "@/components/TableMapPopupContent";
import MapBasemapControl from "@/components/MapBasemapControl";
import { useBasemap } from "@/utils/map";

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
   * Ref object which holds the mapbox instance
   */
  mapRef: MutableRefObject<MapRef | null>;
  /**
   * The data that will be rendered as map features
   */
  geojson: FeatureCollection;
  /**
   * Map configuration object
   */
  mapConfig: TableMapConfig;
}

/**
 * Map which can be configured to render in the Table component
 */
export const TableMap = ({ mapRef, geojson, mapConfig }: TableMapProps) => {
  const [basemapType, setBasemapType] = useState<"streets" | "aerial">(
    "streets"
  );

  const basemapURL = useBasemap(basemapType);

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
  }, [geojsonBounds, mapRef]);

  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature | null>(
    null
  );
  const [cursor, setCursor] = useState("grab");

  const onMouseEnter = useCallback(() => {
    setCursor("pointer");
  }, []);

  const onMouseLeave = useCallback(() => {
    setCursor("grab");
  }, []);

  return (
    <MapGL
      ref={mapRef}
      initialViewState={initialViewState}
      {...DEFAULT_MAP_PARAMS}
      mapStyle={basemapURL}
      cooperativeGestures={true}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      cursor={cursor}
      onLoad={(e) => e.target.resize()}
      maxZoom={21}
      interactiveLayerIds={["points-layer"]} // layer id defined in mapConfig
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        if (e.features?.length) {
          setSelectedFeature(e.features[0]);
        } else {
          setSelectedFeature(null);
        }
      }}
    >
      <FullscreenControl position="bottom-right" />
      <NavigationControl position="top-right" showCompass={false} />
      {/* custom geojson source and layer */}
      <Source id="custom-source" type="geojson" data={geojson}>
        <Layer type="circle" {...mapConfig?.layerProps} />
      </Source>
      <MapFitBoundsControl mapRef={mapRef} bounds={geojsonBounds} />
      <MapBasemapControl
        basemapType={basemapType}
        setBasemapType={setBasemapType}
      />
      {selectedFeature && (
        <PopupWrapper
          longitude={selectedFeature?.properties?.longitude}
          latitude={selectedFeature?.properties?.latitude}
          featureProperties={selectedFeature.properties}
          PopupContent={TableMapPopupContent}
          onClose={() => setSelectedFeature(null)}
        />
      )}
    </MapGL>
  );
};

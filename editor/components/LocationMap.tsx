import { useMemo, MutableRefObject } from "react";
import MapGL, {
  FullscreenControl,
  NavigationControl,
  MapRef,
  Source,
  Layer,
} from "react-map-gl";
import { center } from "@turf/center";
import { DEFAULT_MAP_PAN_ZOOM, DEFAULT_MAP_PARAMS } from "@/configs/map";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapAerialSourceAndLayer } from "./MapAerialSourceAndLayer";
import MapBasemapControl from "@/components/MapBasemapControl";
import { useBasemap } from "@/utils/map";
import { MultiPolygon } from "@/types/geojson";
import { LineLayerSpecification } from "mapbox-gl";

interface LocationMapProps {
  /**
   * Ref object which will hold the mapbox instance
   */
  mapRef: MutableRefObject<MapRef | null>;
  polygon: MultiPolygon;
  locationId: string;
}

const polygonLayer: LineLayerSpecification = {
  id: "location-polygon",
  source: "location-polygon",
  type: "line",
  paint: {
    "line-color": "orange",
    "line-width": 4,
  },
};

const usePolygonFeature = (polygon: MultiPolygon, locationId: string) =>
  useMemo(
    () => [
      {
        type: "Feature",
        properties: {
          id: locationId,
        },
        geometry: polygon,
      },
      center(polygon),
    ],
    [polygon, locationId]
  );

/**
 * Map component which renders an editable point marker
 */
export const LocationMap = ({
  mapRef,
  polygon,
  locationId,
}: LocationMapProps) => {
  const [polygonFeature, centerFeature] = usePolygonFeature(
    polygon,
    locationId
  );

  const { basemapURL, basemapType, setBasemapType } = useBasemap("aerial");

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
        mapType="locationMap"
      />
      {basemapType === "aerial" && <MapAerialSourceAndLayer />}
      <Source type="geojson" data={polygonFeature} id="location-polygon">
        <Layer {...polygonLayer} />
      </Source>
    </MapGL>
  );
};

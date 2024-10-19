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
  LngLatBoundsLike,
  ViewStateChangeEvent,
  MapRef,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { SymbolLayerSpecification, RasterLayerSpecification } from "mapbox-gl";
import { LatLon } from "@/types/types";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
// This API key is managed by CTM. Contact help desk for maintenance and troubleshooting.
const NEARMAP_KEY = process.env.NEXT_PUBLIC_NEARMAP_KEY;

export const defaultInitialState = {
  latitude: 30.2747,
  longitude: -97.7406,
  zoom: 17,
};

const maxBounds: LngLatBoundsLike = [
  [-99, 29],
  [-96, 32],
];

export const mapParameters = {
  touchPitch: false,
  dragRotate: false,
  boxZoom: false,
  mapboxAccessToken: TOKEN,
  maxBounds,
  mapStyle: "mapbox://styles/mapbox/satellite-streets-v11",
};

interface Layers {
  aerials: RasterLayerSpecification;
  streetLabels: SymbolLayerSpecification;
}

const LAYERS: Layers = {
  aerials: {
    id: "simple-tiles",
    type: "raster",
    source: "raster-tiles",
  },
  streetLabels: {
    // borrowed from mapbox mapbox streets v11 style
    id: "street-labels",
    type: "symbol",
    metadata: {
      "mapbox:featureComponent": "road-network",
      "mapbox:group": "Road network, road-labels",
    },
    source: "composite",
    "source-layer": "road",
    minzoom: 12,
    filter: [
      "all",
      ["has", "name"],
      [
        "match",
        ["get", "class"],
        [
          "motorway",
          "trunk",
          "primary",
          "secondary",
          "tertiary",
          "street",
          "street_limited",
        ],
        true,
        false,
      ],
    ],
    layout: {
      "text-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10,
        [
          "match",
          ["get", "class"],
          ["motorway", "trunk", "primary", "secondary", "tertiary"],
          10,
          9,
        ],
        18,
        [
          "match",
          ["get", "class"],
          ["motorway", "trunk", "primary", "secondary", "tertiary"],
          16,
          14,
        ],
      ],
      "text-max-angle": 30,
      "text-font": ["DIN Pro Regular", "Arial Unicode MS Regular"],
      "symbol-placement": "line",
      "text-padding": 1,
      "text-rotation-alignment": "map",
      "text-pitch-alignment": "viewport",
      "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
      "text-letter-spacing": 0.01,
    },
    paint: {
      "text-color": "#fff",
      "text-halo-color": "#000",
      "text-halo-width": 1,
    },
  },
};

export const LOCATION_MAP_CONFIG = {
  mapStyle: "mapbox://styles/mapbox/satellite-streets-v11",
  sources: {
    aerials: {
      id: "raster-tiles",
      type: "raster",
      tiles: [
        `https://api.nearmap.com/tiles/v3/Vert/{z}/{x}/{y}.jpg?apikey=${NEARMAP_KEY}`,
      ],
      tileSize: 256,
    },
  },
  layers: LAYERS,
};

/** Source and layer to display NearMap aerials with street labels on top.
 * Localhost and deploy preview URLs are not on the NearMap tile API key allow list.
 * To test locally, this returns a mock layer to test the layer ordering.
 * Adjust the opacity in the mockPolygonDataLayer paint object for further testing.
 * @param {string} beforeId - layer id to place these layers before
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

  const onDrag = useCallback((e: ViewStateChangeEvent) => {
    const latitude = e.viewState.latitude;
    const longitude = e.viewState.longitude;
    setEditCoordinates({ latitude, longitude });
  }, []);

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
        latitude: savedLatitude || defaultInitialState.latitude,
        longitude: savedLongitude || defaultInitialState.longitude,
        zoom: defaultInitialState.zoom,
      }}
      {...mapParameters}
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
        >
          {/* <Pin size={40} color={"warning"} /> */}
        </Marker>
      )}
      {/* add nearmap raster source and style */}
      <LabeledAerialSourceAndLayer />
    </MapGL>
  );
};

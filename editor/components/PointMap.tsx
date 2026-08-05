import {
  ComponentType,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode,
  RefObject,
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
import { MapFeatureRegistryProvider } from "@/contexts/MapFeatureRegistry";
import { featureCollection, point, feature } from "@turf/helpers";
import type { Feature, Geometry } from "geojson";

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
  mapRef: RefObject<MapRef | null>;

  /**
   * The default basemap type
   */
  initialBasemapType?: "aerial" | "streets";
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
  draftLatLon?: LatLon;
  setDraftLatLon?: Dispatch<SetStateAction<LatLon>>;
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
  /**
   * If true, fit the map to every registered feature (saved point +
   * anything children report via useRegisterMapFeature/useRegisterMapFeatures)
   * once on mount, instead of relying solely on initialViewState.
   * Default: false, to preserve existing behavior for callers that don't opt in.
   */
  autoFitBounds?: boolean;
}

/**
 * Map component which renders a point marker, may be editable
 */
export const PointMap = ({
  mapRef,
  initialBasemapType,
  savedLatitude,
  savedLongitude,
  isEditing,
  draftLatLon,
  setDraftLatLon,
  CustomMarker,
  children,
  customLayerToggles,
  autoFitBounds = true,
}: PointMapProps) => {
  const { basemapURL, basemapType, setBasemapType } = useBasemap(
    initialBasemapType || "aerial"
  );

  const onDrag = useCallback(
    (e: ViewStateChangeEvent) => {
      // truncate values to our preferred precision
      const latitude = +e.viewState.latitude.toFixed(MAP_COORDINATE_PRECISION);
      const longitude = +e.viewState.longitude.toFixed(
        MAP_COORDINATE_PRECISION
      );
      if (setDraftLatLon) {
        setDraftLatLon({
          latitude,
          longitude,
        });
      }
    },
    [setDraftLatLon]
  );

  useEffect(() => {
    if (!isEditing && setDraftLatLon) {
      // initialize edit coordinates and reset them after saving
      setDraftLatLon({
        latitude: savedLatitude || DEFAULT_MAP_PAN_ZOOM.latitude,
        longitude: savedLongitude || DEFAULT_MAP_PAN_ZOOM.longitude,
      });
    }
  }, [isEditing, setDraftLatLon, savedLatitude, savedLongitude]);

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

  /**
   * Tracks geometry reported by children via the MapFeatureRegistry
   * (e.g. Markers, GeoJSON layers) so the map can be fit to
   * everything currently rendered, not just the saved lat/lon.
   */
  const [registeredFeatures, setRegisteredFeatures] = useState<
    Map<string, Geometry | Geometry[]>
  >(new Map());

  /**
   * This callback will update registeredFeatures whenever
   * a new feature is registered in map registry context
   */
  const onFeaturesChange = useCallback(
    (features: Map<string, Geometry | Geometry[]>) => {
      setRegisteredFeatures(features);
    },
    []
  );

  const hasFitRef = useRef(false);

  /**
   * Construct a FeatureCollection from the feature registry
   */
  const allFeatures = useMemo(() => {
    const feats: Feature<Geometry>[] = [];

    if (savedLatitude != null && savedLongitude != null) {
      feats.push(point([savedLongitude, savedLatitude]));
    }

    registeredFeatures.forEach((geom) => {
      if (Array.isArray(geom)) {
        geom.forEach((g) => feats.push(feature(g)));
      } else {
        feats.push(feature(geom));
      }
    });

    return featureCollection(feats);
  }, [savedLatitude, savedLongitude, registeredFeatures]);

  const totalBounds = useCurrentBounds(allFeatures);

  /**
   * Hook which manages auto-fitting the map bounds based on all
   * registered features plus the saved lat/lon
   */
  useEffect(() => {
    if (!autoFitBounds || hasFitRef.current) return;
    const map = mapRef.current;
    if (!map) return;

    const fit = () => {
      if (allFeatures.features.length === 0) return;

      // Single point: center rather than fitBounds on a zero-area box
      if (allFeatures.features.length === 1) {
        const g = allFeatures.features[0].geometry;
        if (g.type === "Point") {
          const [lng, lat] = g.coordinates;
          map.easeTo({
            center: [lng, lat],
            zoom: DEFAULT_MAP_PAN_ZOOM.zoom,
            duration: 0,
          });
        }
        hasFitRef.current = true;
        return;
      }

      if (!totalBounds) return;
      map.fitBounds(totalBounds, {
        padding: 60,
        maxZoom: DEFAULT_MAP_PAN_ZOOM.zoom,
        duration: 0,
      });
      hasFitRef.current = true;
    };

    if (map.isStyleLoaded()) fit();
    else map.once("idle", fit);
  }, [autoFitBounds, mapRef, allFeatures, totalBounds]);

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
      <MapFitBoundsControl mapRef={mapRef} bounds={totalBounds} />
      {setDraftLatLon && (
        <MapGeocoderControl
          position="top-left"
          onResult={(latLon: LatLon) => setDraftLatLon(latLon)}
        />
      )}
      <MapBasemapControl
        basemapType={basemapType}
        setBasemapType={setBasemapType}
        customLayerToggles={customLayerToggles}
        controlId="pointMap"
      />

      {/* Custom layers */}
      <MapFeatureRegistryProvider onFeaturesChange={onFeaturesChange}>
        {children}
      </MapFeatureRegistryProvider>

      {/* editable + not editable point layers */}
      {savedLatitude && savedLongitude && !isEditing && (
        <Marker
          key={dynamicMarkerKey}
          latitude={savedLatitude}
          longitude={savedLongitude}
          color={COLORS.primary}
        />
      )}
      {isEditing && draftLatLon && (
        <Marker
          key={dynamicMarkerKey}
          latitude={draftLatLon.latitude}
          longitude={draftLatLon.longitude}
          color={isEditing ? COLORS.danger : undefined}
        />
      )}
    </MapGL>
  );
};

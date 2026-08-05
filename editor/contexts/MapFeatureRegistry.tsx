import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from "react";
import type { Feature, Geometry } from "geojson";

type RegisteredGeometry = Geometry | Geometry[];

interface MapFeatureContextValue {
  register: (id: string, geometry: RegisteredGeometry) => void;
  unregister: (id: string) => void;
}

const MapFeatureContext = createContext<MapFeatureContextValue | null>(null);

export function MapFeatureRegistryProvider({
  children,
  onFeaturesChange,
}: {
  children: ReactNode;
  onFeaturesChange: (features: Map<string, RegisteredGeometry>) => void;
}) {
  const featuresRef = useRef<Map<string, RegisteredGeometry>>(new Map());

  const register = useCallback(
    (id: string, geometry: RegisteredGeometry) => {
      featuresRef.current.set(id, geometry);
      onFeaturesChange(new Map(featuresRef.current));
    },
    [onFeaturesChange]
  );

  const unregister = useCallback(
    (id: string) => {
      featuresRef.current.delete(id);
      onFeaturesChange(new Map(featuresRef.current));
    },
    [onFeaturesChange]
  );

  const value = useMemo(
    () => ({ register, unregister }),
    [register, unregister]
  );

  return (
    <MapFeatureContext.Provider value={value}>
      {children}
    </MapFeatureContext.Provider>
  );
}

/**
 * Register a single point (e.g. a Marker). Pass a stable id and
 * either a {latitude, longitude} pair or null (e.g. while unresolved).
 */
export function useRegisterMapFeature(
  id: string,
  latLon: { latitude: number; longitude: number } | null
) {
  const ctx = useContext(MapFeatureContext);

  useEffect(() => {
    if (!ctx || !latLon) return;

    ctx.register(id, {
      type: "Point",
      coordinates: [latLon.longitude, latLon.latitude],
    });
    return () => ctx.unregister(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, id, latLon?.latitude, latLon?.longitude]);
}

/**
 * Register a set of GeoJSON features. Pass a stable id and an array of
 * Features; re-registers whenever the array reference changes, so it
 * stays in sync with filtered/updated data.
 */
export function useRegisterMapFeatures(id: string, features: Feature[] | null) {
  const ctx = useContext(MapFeatureContext);

  useEffect(() => {
    if (!ctx || !features || features.length === 0) return;
    ctx.register(
      id,
      features.map((f) => f.geometry)
    );
    return () => ctx.unregister(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, id, features]);
}

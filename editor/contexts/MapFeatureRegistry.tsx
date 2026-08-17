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

/**
 * A lightweight registry that lets arbitrary map children (Markers,
 * GeoJSON layers, etc.) report their geometry up to a parent map
 * component, without that parent needing to know what its children are.
 *
 * The parent renders a `MapFeatureRegistryProvider` around `children` and
 * passes an `onFeaturesChange` callback to receive the live set of
 * registered geometries (keyed by id) whenever anything registers,
 * unregisters, or updates. Children call `useRegisterMapFeature` (single
 * point) or `useRegisterMapFeatures` (multiple features) to participate.
 *
 * Typical use: a map component wants to compute a bounding box that fits
 * everything currently rendered on the map, but the set of rendered
 * things is determined by whatever children happen to be passed in.
 */

/**
 * The geometry shape a single feature can contribute: either one
 * Geometry (e.g. a Point for a Marker) or an array of Geometries (e.g.
 * one per feature in a GeoJSON layer).
 */
type RegisteredGeometry = Geometry | Geometry[];

/**
 * Shape of the context value exposed to registrant hooks. `register` and
 * `unregister` are keyed by a caller-supplied stable id so that repeated
 * calls (e.g. on re-render, or on data change) correctly replace rather
 * than duplicate a given registrant's entry.
 */
interface MapFeatureContextValue {
  register: (id: string, geometry: RegisteredGeometry) => void;
  unregister: (id: string) => void;
}

const MapFeatureContext = createContext<MapFeatureContextValue | null>(null);

/**
 * Provider that backs the feature registry. Wrap it around map children
 * that may call `useRegisterMapFeature`/`useRegisterMapFeatures`; every
 * time a child registers, unregisters, or changes its geometry,
 * `onFeaturesChange` fires with a fresh snapshot `Map` of everything
 * currently registered (id -> geometry).
 *
 * Registrations are tracked in a ref (not state) internally, so the
 * provider itself never re-renders on registration changes — only the
 * `onFeaturesChange` callback fires, letting the parent decide how to
 * respond (e.g. store it in its own state to trigger a bounds refit).
 *
 * `onFeaturesChange` shold be a function with a stable reference that
 *  would typically set state in the parent component to expose the
 * registered features.
 *
 * @example
 * ```tsx
 * const onFeaturesChange = useCallback(
 *   (features: Map<string, Geometry | Geometry[]>) => {
 *     setRegisteredFeatures(features);
 *   },
 *   []
 * );
 * ```
 */
export function MapFeatureRegistryProvider({
  children,
  onFeaturesChange,
}: {
  children: ReactNode;
  onFeaturesChange: (features: Map<string, RegisteredGeometry>) => void;
}) {
  // Source of truth for registrations. A ref (not state) so that
  // register/unregister don't cause this provider to re-render on every
  // child registration — the parent is notified via onFeaturesChange
  // instead, and decides for itself whether/how to re-render.
  const featuresRef = useRef<Map<string, RegisteredGeometry>>(new Map());

  const register = useCallback(
    (id: string, geometry: RegisteredGeometry) => {
      // Keyed by id, so re-registering the same id (e.g. on re-render,
      // or when a child's geometry changes) overwrites in place rather
      // than accumulating duplicates.
      featuresRef.current.set(id, geometry);
      // Snapshot into a new Map so the parent gets a distinct reference
      // it can diff against / store in state. Mutating and passing
      // featuresRef.current directly would break that.
      onFeaturesChange(new Map(featuresRef.current));
    },
    [onFeaturesChange]
  );

  const unregister = useCallback(
    (id: string) => {
      featuresRef.current.delete(id);
      // Same snapshot rationale as above.
      onFeaturesChange(new Map(featuresRef.current));
    },
    [onFeaturesChange]
  );

  // Memoized so consumers of the context don't see a new value (and
  // re-run effects keyed on it) unless register/unregister themselves
  // change identity, which only happens if onFeaturesChange changes.
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
 * Register a single point (e.g. a Marker). Pass a stable id unique to
 * all registrants and either a {latitude, longitude} pair or null.
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
 * Register a set of GeoJSON features. Pass a stable id uniqe to this
 * feature set and an array of Features.
 *
 * Re-registers whenever the array reference changes, so it
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
  }, [ctx, id, features]);
}

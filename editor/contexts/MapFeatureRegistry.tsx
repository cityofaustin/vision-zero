import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from "react";
import type { Feature } from "geojson";

/**
 * A lightweight registry that lets arbitrary map children (Markers,
 * GeoJSON layers, etc.) report their feature up to a parent map
 * component, without that parent needing to know what its children are.
 *
 * The parent renders a `MapFeatureRegistryProvider` around `children` and
 * passes an `onFeaturesChange` callback to receive the live set of
 * registered features (keyed by id) whenever anything registers,
 * unregisters, or updates. Children call `useRegisterMapFeature` (single
 * feature) or `useRegisterMapFeatures` (multiple features) to participate.
 *
 * Typical use: a map component wants to compute a bounding box that fits
 * everything currently rendered on the map, but the set of rendered
 * things is determined by whatever children happen to be passed in.
 */

/**
 * The shape a single RegisteredFeature can take: either one
 * Feature or an array of them (e.g. one per feature in a GeoJSON layer).
 */
type RegisteredFeature = Feature | Feature[];

/**
 * Shape of the context value exposed to registrant hooks. `register` and
 * `unregister` are keyed by a caller-supplied stable id so that repeated
 * calls (e.g. on re-render, or on data change) correctly replace rather
 * than duplicate a given registrant's entry.
 */
interface MapFeatureContextValue {
  register: (id: string, geometry: RegisteredFeature) => void;
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
 * `onFeaturesChange` should be a function with a stable reference that
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
  onFeaturesChange: (features: Map<string, RegisteredFeature>) => void;
}) {
  // Source of truth for registrations. A ref (not state) so that
  // register/unregister don't cause this provider to re-render on every
  // child registration — the parent is notified via onFeaturesChange
  // instead, and decides for itself whether/how to re-render.
  const featuresRef = useRef<Map<string, RegisteredFeature>>(new Map());

  const register = useCallback(
    (id: string, geometry: RegisteredFeature) => {
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
 * Register a single feature geojson Feature. Pass a stable id unique to
 * all registrants and a Feature or null.
 */
export function useRegisterMapFeature(id: string, feature: Feature | null) {
  const ctx = useContext(MapFeatureContext);

  useEffect(() => {
    if (!ctx || !feature) return;

    ctx.register(id, feature);
    return () => ctx.unregister(id);
  }, [ctx, id, feature]);
}

/**
 * Register a set of GeoJSON features. Pass a stable id unique to this
 * feature set and an array of Features.
 *
 * Re-registers whenever the array reference changes, so it
 * stays in sync with filtered/updated data.
 */
export function useRegisterMapFeatures(id: string, features: Feature[] | null) {
  const ctx = useContext(MapFeatureContext);

  useEffect(() => {
    if (!ctx || !features || features.length === 0) return;

    ctx.register(id, features);
    return () => ctx.unregister(id);
  }, [ctx, id, features]);
}

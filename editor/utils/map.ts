import { useEffect, useMemo, useRef, useState } from "react";
import { bbox } from "@turf/bbox";
import { AllGeoJSON } from "@turf/helpers";
import { FeatureCollection, Point } from "geojson";
import { LngLatBoundsLike } from "mapbox-gl";
import { mapStyleOptions } from "@/configs/map";
import { useTheme } from "@/contexts/AppThemeProvider";

/**
 * Resize observer hook that can be used to trigger resize() when the
 * map container size changes
 * 
 * @example
 * const mapContainerRef = useResizeObserver<HTMLDivElement>(() => {
    mapRef.current?.resize();
  });
 */
export function useResizeObserver<T extends HTMLElement>(
  callback: () => void,
  debounceDelay: number = 50
) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    // Capture the current value of the ref when the effect runs
    const currentElement = containerRef.current;

    const observer = new ResizeObserver(() => {
      // This timeout has a debouncing effect that prevents
      // the map from flashing on the screen during sidebar
      // animation. A more robust implementation would clear the
      // previous timeout interval but the performance hit
      // seems negligible
      setTimeout(() => {
        callback();
      }, debounceDelay);
    });

    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      // Use the captured value in the cleanup function
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [callback, debounceDelay]);

  return containerRef;
}

/**
 * Hook which computes the bounding box of the provided geojson
 *
 * Returns undefined if the geojson has no features
 */
export const useCurrentBounds = (
  geojson: AllGeoJSON
): LngLatBoundsLike | undefined =>
  useMemo(() => {
    const bounds = bbox(geojson);

    if (Math.abs(bounds[0]) > 180) {
      return undefined;
    }

    return [
      [bounds[0], bounds[1]],
      [bounds[2], bounds[3]],
    ];
  }, [geojson]);

/**
 * Custom hook that manages basemap state and returns the appropriate basemap URL
 * depending on the selected basemap type and app theme
 */
export const useBasemap = (initialBasemapType: "streets" | "aerial") => {
  const [basemapType, setBasemapType] = useState<"streets" | "aerial">(
    initialBasemapType
  );
  const { theme } = useTheme();

  const basemapURL = useMemo(() => {
    if (basemapType === "streets") {
      return theme === "dark"
        ? mapStyleOptions.darkStreets
        : mapStyleOptions.lightStreets;
    }
    return mapStyleOptions.aerial;
  }, [basemapType, theme]);

  return {
    basemapURL,
    basemapType,
    setBasemapType,
  };
};

/**
 * An index of functions that transform input data into a geojson feature collection
 */
export const geoJsonTransformers = {
  latLon: (data: Record<string, unknown>[]): FeatureCollection<Point> => {
    if (!data || data.length === 0) {
      return {
        type: "FeatureCollection" as const,
        features: [],
      };
    }
    const features = data
      .filter((row) => row.latitude && row.longitude) // Filter out items without coordinates
      .map((row, index) => ({
        type: "Feature" as const,
        id: index,
        geometry: {
          type: "Point" as const,
          coordinates: [Number(row.longitude), Number(row.latitude)],
        },
        properties: {
          ...row, // Include all original data as properties
        },
      }));
    return {
      type: "FeatureCollection" as const,
      features,
    };
  },
};

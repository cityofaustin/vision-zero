import { useEffect, useMemo, useRef } from "react";
import { bbox } from "@turf/bbox";
import { FeatureCollection } from "geojson";
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
 * Returns the URL for the basemap type depending on app theme
 */
export const useBasemap = (basemapType: "streets" | "aerial") => {
  const themeMode = useTheme();

  return useMemo(() => {
    if (basemapType === "streets") {
      return themeMode === "dark"
        ? mapStyleOptions.darkStreets
        : mapStyleOptions.lightStreets;
    }
    return mapStyleOptions.aerial;
  }, [basemapType, themeMode]);
};

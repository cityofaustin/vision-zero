import { useEffect, useMemo, useRef, useState } from "react";
import { bbox } from "@turf/bbox";
import { AllGeoJSON, lineString } from "@turf/helpers";
import { FeatureCollection } from "geojson";
import { LngLatBoundsLike } from "mapbox-gl";
import { mapStyleOptions } from "@/configs/map";
import { useTheme } from "@/contexts/AppThemeProvider";
import { LatLon } from "@/components/TableMap";

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
    console.log(geojson);
    if (geojson.type == "FeatureCollection") {
      if (!geojson.features.length) {
        return undefined;
      }
      const bounds = bbox(geojson);

      return [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ];
    }
    if (geojson.type == "Point") {
      const point = {
        longitude: geojson.coordinates[0],
        latitude: geojson.coordinates[1],
      };
      if (!point?.latitude || !point?.longitude) {
        return undefined;
      }

      return [
        [point.longitude, point.latitude],
        [point.longitude, point.latitude],
      ];
    }
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

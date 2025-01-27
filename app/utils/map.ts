import { useEffect, useRef } from "react";

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

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [callback, debounceDelay]);

  return containerRef;
}

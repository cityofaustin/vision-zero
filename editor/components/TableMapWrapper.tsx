import { useMemo, useRef } from "react";
import { MapRef } from "react-map-gl";
import { useResizeObserver } from "@/utils/map";
import { TableMap } from "@/components/TableMap";
import { TableMapConfig } from "@/types/tableMapConfig";
import { geoJsonTransformers } from "@/utils/map";

interface TableMapWrapperProps<T extends Record<string, unknown>> {
  mapConfig: TableMapConfig;
  data: T[];
}

/**
 * Card component that renders the crash map and edit controls
 */
export default function TableMapWrapper<T extends Record<string, unknown>>({
  mapConfig,
  data,
}: TableMapWrapperProps<T>) {
  const mapRef = useRef<MapRef | null>(null);
  /**
   * Trigger resize() when the map container size changes - this ensures that
   * the map repaints when the sidebar is collapsed/expanded.
   */
  const mapContainerRef = useResizeObserver<HTMLDivElement>(() => {
    mapRef.current?.resize();
  });

  /**
   * Hook which transforms the input data into a geojson FeatureCollection
   */
  const geojson = useMemo(() => {
    const transformer = geoJsonTransformers[mapConfig.geojsonTransformerName];
    return transformer(data);
  }, [data, mapConfig.geojsonTransformerName]);

  return (
    <div className="table-map-container d-flex flex-grow-1" ref={mapContainerRef}>
      <TableMap mapRef={mapRef} geojson={geojson} mapConfig={mapConfig} />
    </div>
  );
}

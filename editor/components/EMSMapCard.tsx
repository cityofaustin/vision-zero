import { useRef, useState } from "react";
import Card from "react-bootstrap/Card";
import { MapRef } from "react-map-gl";
import { CrashMap, LatLon } from "@/components/CrashMap";
import { useResizeObserver } from "@/utils/map";
import { DEFAULT_MAP_PAN_ZOOM } from "@/configs/map";

interface EMSMapCardProps {
  savedLatitude: number | null;
  savedLongitude: number | null;
}

/**
 * Card component that renders the crash map with no editing capabilities
 */
export default function EMSMapCard({
  savedLatitude,
  savedLongitude,
}: EMSMapCardProps) {
  const mapRef = useRef<MapRef | null>(null);
  /**
   * Trigger resize() when the map container size changes - this ensures that
   * the map repaints when the sidebar is collased/expanded.
   */
  const mapContainerRef = useResizeObserver<HTMLDivElement>(() => {
    mapRef.current?.resize();
  });

  const [mapLatLon, setMapLatLon] = useState<LatLon>({
    latitude: DEFAULT_MAP_PAN_ZOOM.latitude,
    longitude: DEFAULT_MAP_PAN_ZOOM.longitude,
  });

  return (
    <Card className="h-100">
      <Card.Body className="p-1 crash-header-card-body" ref={mapContainerRef}>
        <CrashMap
          savedLatitude={savedLatitude}
          savedLongitude={savedLongitude}
          isEditing={false}
          mapLatLon={mapLatLon}
          setMapLatLon={setMapLatLon}
          mapRef={mapRef}
        />
      </Card.Body>
    </Card>
  );
}

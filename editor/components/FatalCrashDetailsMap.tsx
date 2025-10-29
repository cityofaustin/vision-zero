import { useRef } from "react";
import { MapRef } from "react-map-gl";
import { PointMap } from "@/components/PointMap";
import { Row } from "react-bootstrap";

/**
 *  Component that renders the crash map with no editing capabilities
 */
export default function FatalCrashDetailsMap({ record }) {
  const mapRef = useRef<MapRef | null>(null);

  const latitude: number | null = record && record.latitude;
  const longitude: number | null = record && record.longitude;

  return (
    <Row className="p-1 crash-header-card-body">
      <PointMap
        savedLatitude={latitude}
        savedLongitude={longitude}
        mapRef={mapRef}
      />
    </Row>
  );
}

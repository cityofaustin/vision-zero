import Link from "next/link";
import { formatIsoDate, formatIsoDateTime } from "@/utils/formatters";
import { GeoJsonProperties } from "geojson";

export interface VzMapPopupContentProps {
  properties: GeoJsonProperties;
}

export default function VzMapPopupContent({
  properties,
}: VzMapPopupContentProps) {
  return (
    <div className="h-100 m-1 px-1" style={{ minWidth: "135px" }}>
      <div className="fw-bold fs-6 pb-2 border-bottom">
        {properties?.addresses}
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-bold">VZ Incident ID</span>
        <span className="text-muted">{properties?.id}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-bold">Date</span>
        <span className="text-muted">
          {formatIsoDateTime(properties?.first_response_date)}
        </span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-bold">Agency</span>
        <span className="text-muted">{properties?.agencies}</span>
      </div>
    </div>
  );
}

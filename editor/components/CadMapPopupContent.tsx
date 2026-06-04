import Link from "next/link";
import { formatIsoDate, formatIsoDateTime } from "@/utils/formatters";
import { GeoJsonProperties } from "geojson";

export interface CadMapPopupContentProps {
  properties: GeoJsonProperties;
}

export default function CadMapPopupContent({
  properties,
}: CadMapPopupContentProps) {
  return (
    <div className="h-100 m-1 px-1" style={{ minWidth: "135px" }}>
      <div className="fw-bold fs-6 pb-2 border-bottom">
        {properties?.address}
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-bold">Incident ID</span>
        <span className="text-muted">{properties?.vz_incident_id}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-bold">Date</span>
        <span className="text-muted">
          {formatIsoDateTime(properties?.response_date)}
        </span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-bold">Agency</span>
        <span className="text-muted">{properties?.agency_type}</span>
      </div>
    </div>
  );
}

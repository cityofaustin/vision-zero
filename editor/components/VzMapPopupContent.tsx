import Link from "next/link";
import { formatArrayToString, formatIsoDateTime } from "@/utils/formatters";
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
        {properties?.address}
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-bold me-2">Incident ID</span>
        <span className="text-muted">
          <Link href={`/incidents/${properties?.id}`} prefetch={false}>
            {properties?.id}
          </Link>
        </span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-bold me-2">Date</span>
        <span className="text-muted">
          {formatIsoDateTime(properties?.record_timestamp)}
        </span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-bold me-2">Agencies</span>
        <span className="text-muted text-uppercase">
          {formatArrayToString(JSON.parse(properties?.responding_agencies))}
        </span>
      </div>
    </div>
  );
}

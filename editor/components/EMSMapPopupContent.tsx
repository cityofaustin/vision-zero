import Link from "next/link";
import { formatDate } from "@/utils/formatters";
import { GeoJsonProperties } from "geojson";

export interface EMSMapPopupContentProps {
  properties: GeoJsonProperties;
}

export default function EMSMapPopupContent({
  properties,
}: EMSMapPopupContentProps) {
  console.log(properties)
  return (
    <div className="h-100 m-1 px-1" style={{ minWidth: "135px" }}>
      <div className="fw-bold fs-6 pb-2 border-bottom">
        {properties?.incident_location_address}
      </div>
      <div className="d-flex justify-content-between pt-2">
        <span className="fw-bold">Incident</span>
        <Link href={`/fatalities/${properties?.record_locator}`} prefetch={false}>
          {properties?.incident_number}
        </Link>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-bold">Date</span>
        <span className="text-muted">
          {formatDate(properties?.incident_received_datetime)}
        </span>
      </div>
    </div>
  );
}

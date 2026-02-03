import Link from "next/link";
import { formatDate } from "@/utils/formatters";
import { GeoJsonProperties } from "geojson";

export interface FatalitiesMapPopupContentProps {
  properties: GeoJsonProperties;
}

export default function FatalitiesMapPopupContent({
  properties,
}: FatalitiesMapPopupContentProps) {
  return (
    <div className="h-100 m-1 px-1" style={{ minWidth: "125px" }}>
      <div className="fw-bold fs-6 pb-2 border-bottom">
        {properties?.address_display}
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-bold">Crash ID</span>
        <Link href={`/fatalities/${properties?.record_locator}`} prefetch={false}>
          {properties?.record_locator}
        </Link>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-bold">Date</span>
        <span className="text-muted">
          {formatDate(properties?.crash_timestamp)}
        </span>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-bold">YTD Fatal Crash</span>
        <span className="text-muted">
          {properties?.ytd_fatal_crash}
        </span>
      </div>
    </div>
  );
}

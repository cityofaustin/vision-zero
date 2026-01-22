import Link from "next/link";
import { formatDate } from "@/utils/formatters";
import { TableMapPopupContentProps } from "./TableMapPopupContent";

export default function LocationTableMapPopupContent({
  properties,
}: TableMapPopupContentProps) {
  return (
    <div className="h-100 m-1 px-1" style={{ minWidth: "125px" }}>
      <div className="fw-bold fs-6 pb-2 border-bottom">
        {properties?.address_display}
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-bold">Type</span>
        {properties?.type}
      </div>
      {properties?.type === "CR3" ? (
        <div className="d-flex justify-content-between">
          <span className="fw-bold">Crash ID</span>
          <Link
            href={`/crashes/${properties?.record_locator}`}
            prefetch={false}
          >
            {properties?.record_locator}
          </Link>
        </div>
      ) : (
        <div className="d-flex justify-content-between">
          <span className="fw-bold">Case ID</span>
          {properties?.case_id}
        </div>
      )}
      <div className="d-flex justify-content-between">
        <span className="fw-bold">Date</span>
        <span className="text-muted">
          {formatDate(properties?.crash_timestamp)}
        </span>
      </div>
    </div>
  );
}

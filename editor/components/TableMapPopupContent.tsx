import Link from "next/link";

interface TableMapPopupContent {
  properties: any;
}

export default function TableMapPopupContent({
  properties,
}: TableMapPopupContent) {
  return (
    <div className="h-100">
      <div className="fw-bold fs-6 pb-2 border-bottom">
        {properties.address_primary}
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-bold">Crash ID</span>
        <Link href={`/crashes/${properties.record_locator}`} prefetch={false}>
          {properties.record_locator}
        </Link>
      </div>
      <div className="d-flex justify-content-between">
        <span className="fw-bold">Date</span>
        <span className="text-muted">{properties.crash_timestamp}</span>
      </div>
    </div>
  );
}

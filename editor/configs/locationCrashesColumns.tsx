import Link from "next/link";
import { ColDataCardDef } from "@/types/types";
import { LocationCrashRow } from "@/types/locationCrashes";
import { formatDate, formatDollars } from "@/utils/formatters";

export const locationCrashesColumns: ColDataCardDef<LocationCrashRow>[] = [
  {
    path: "type",
    label: "Type",
    sortable: true,
  },
  {
    path: "record_locator",
    label: "Crash ID",
    sortable: true,
    valueRenderer: (record: LocationCrashRow) =>
      record.record_locator ? (
        <Link href={`/crashes/${record.record_locator}`}>
          {record.record_locator}
        </Link>
      ) : (
        ""
      ),
  },
  {
    path: "case_id",
    label: "Case ID",
    sortable: true,
  },
  {
    path: "crash_timestamp",
    label: "Date",
    sortable: true,
    valueFormatter: formatDate,
  },
  {
    path: "address_primary",
    label: "Primary address",
    sortable: true,
  },
  {
    path: "address_secondary",
    label: "Secondary address",
    sortable: true,
  },
  {
    path: "sus_serious_injry_count",
    label: "Serious injuries",
    sortable: true,
  },
  {
    path: "vz_fatality_count",
    label: "Fatalities",
    sortable: true,
  },
  {
    path: "collsn_desc",
    label: "Collision type",
    sortable: true,
  },
  {
    path: "est_comp_cost_crash_based",
    label: "Est Comprehensive Cost",
    sortable: true,
    valueFormatter: formatDollars,
  },
  {
    path: "latitude",
    label: "latitude",
    exportOnly: true,
    fetchAlways: true,
  },
    {
    path: "longitude",
    label: "longitude",
    exportOnly: true,
    fetchAlways: true,
  },
];

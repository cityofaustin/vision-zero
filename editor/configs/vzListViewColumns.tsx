import Link from "next/link";
import {
  formatArrayToString,
  formatArrayToStringWithLinebreaks,
  formatIsoDateTime,
} from "@/utils/formatters";
import { ColDataCardDef } from "@/types/types";
import { VzIncident } from "@/types/vzIncident";

export const vzListViewColumns: ColDataCardDef<VzIncident>[] = [
  {
    path: "id",
    label: "ID",
    sortable: true,
    fetchAlways: true,
    valueRenderer: (record: VzIncident) => (
      <Link href={`/incidents/${record.id}`} prefetch={false}>
        {record.id}
      </Link>
    ),
  },
  {
    path: "record_timestamp",
    label: "Date",
    sortable: true,
    style: { minWidth: "12rem" },
    valueFormatter: formatIsoDateTime,
    fetchAlways: true,
  },
  {
    path: "address",
    label: "Address",
    sortable: true,
    fetchAlways: true,
  },
  {
    path: "responding_agencies",
    label: "Agencies",
    sortable: true,
    valueFormatter: formatArrayToStringWithLinebreaks,
    style: { whiteSpace: "pre-wrap", textTransform: "uppercase" },
    fetchAlways: true,
  },
  {
    path: "location_ids",
    label: "Location ID(s)",
    valueFormatter: formatArrayToString,
  },
  {
    path: "incident_numbers",
    label: "Incident #(s)",
    valueFormatter: formatArrayToString,
  },
  {
    path: "record_count",
    label: "Record count",
    sortable: true,
  },
  {
    path: "record_tables",
    label: "record_tables",
    valueFormatter: formatArrayToString,
  },
  {
    path: "point_feature",
    label: "point_feature",
    fetchAlways: true,
    exportOnly: true,
  },
];

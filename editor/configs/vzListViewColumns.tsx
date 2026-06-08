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
    path: "cad_incident_count",
    label: "CAD count",
    sortable: true,
  },
  {
    path: "response_date_earliest",
    label: "Date",
    sortable: true,
    style: { minWidth: "8rem" },
    valueFormatter: formatIsoDateTime,
    fetchAlways: true,
  },
  {
    path: "agencies",
    label: "Agencies",
    sortable: true,
    valueFormatter: formatArrayToString,
    style: { whiteSpace: "pre-wrap", textTransform: "uppercase" },
    fetchAlways: true
  },
  {
    path: "address_earliest",
    label: "Address",
    sortable: true,
    fetchAlways: true
  },
  {
    path: "final_problems",
    label: "Final problems",
    sortable: true,
    valueFormatter: formatArrayToStringWithLinebreaks,
    style: { whiteSpace: "pre-wrap" },
  },
  {
    path: "call_dispositions",
    label: "Call dispositions",
    valueFormatter: formatArrayToStringWithLinebreaks,
    sortable: true,
    style: { whiteSpace: "pre-wrap" },
  },
  {
    path: "point_feature",
    label: "point_feature",
    fetchAlways: true,
    exportOnly: true,
  },
];

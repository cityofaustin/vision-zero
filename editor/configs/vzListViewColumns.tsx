import Link from "next/link";
import {
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
      <Link href={`/cad/${record.id}`} prefetch={false}>
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
    path: "first_response_date",
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
    valueFormatter: formatArrayToStringWithLinebreaks,
    style: { whiteSpace: "pre-wrap" },
    fetchAlways: true
  },
  {
    path: "addresses",
    label: "Addresses",
    sortable: true,
    valueFormatter: formatArrayToStringWithLinebreaks,
    style: { whiteSpace: "pre-wrap" },
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
    path: "incident_points",
    label: "incident_points",
    fetchAlways: true,
    exportOnly: true,
  },
];

import Link from "next/link";
import { formatYesNoString, formatIsoDateTime } from "@/utils/formatters";
import { ColDataCardDef } from "@/types/types";
import { CadIncident } from "@/types/cadIncident";

export const cadListViewColumns: ColDataCardDef<CadIncident>[] = [
  {
    path: "id",
    label: "ID",
    sortable: true,
    fetchAlways: true,
    valueRenderer: (record: CadIncident) => (
      <Link href={`/cad/${record.id}`} prefetch={false}>
        {record.id}
      </Link>
    ),
  },
  {
    path: "vz_incident_id",
    label: "VZ ID",
    sortable: true,
  },
  {
    path: "response_date",
    label: "Date",
    sortable: true,
    style: { minWidth: "8rem" },
    valueFormatter: formatIsoDateTime,
    fetchAlways: true,
  },
  {
    path: "agency_type",
    label: "Agency",
    sortable: true,
  },
  {
    path: "address",
    label: "Address",
    sortable: true,
  },
  {
    path: "final_problem",
    label: "Final problem",
    sortable: true,
  },
  {
    path: "call_disposition",
    label: "Call disposition",
    sortable: true,
  },
  {
    path: "is_cancelled_call",
    label: "Cancelled call",
    valueFormatter: formatYesNoString,
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

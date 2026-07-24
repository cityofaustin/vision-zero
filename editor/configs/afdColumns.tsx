import { AfdIncident } from "@/types/afd";
import { ColDataCardDef } from "@/types/types";
import { formatIsoDateTime } from "@/utils/formatters";

export const afdColumns: ColDataCardDef<AfdIncident>[] = [
  {
    path: "incident_number",
    label: "Incident number",
    sortable: true,
  },
  {
    path: "call_datetime",
    label: "Date",
    sortable: true,
    style: { minWidth: "8rem" },
    valueFormatter: formatIsoDateTime,
    fetchAlways: true,
  },
  {
    path: "address",
    label: "Address",
    sortable: true,
  },
  {
    path: "problem",
    label: "Problem",
    sortable: true,
  },
];

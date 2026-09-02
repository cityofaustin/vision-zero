import { CadIncident } from "@/types/cadIncident";
import { ColDataCardDef } from "@/types/types";
import { formatIsoDateTime, formatYesNoString } from "@/utils/formatters";

export const cadColumns: ColDataCardDef<CadIncident>[] = [
  {
    path: "agency_type_short",
    label: "Agency",
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
    path: "address",
    label: "Address",
    sortable: true,
  },
  {
    path: "time_first_unit_arrived",
    label: "On scene",
    valueFormatter: formatYesNoString,
  },
  {
    path: "initial_problem",
    label: "Initial problem",
    sortable: true,
    defaultHidden: true,
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
    path: "incident_type",
    label: "Type",
    sortable: true,
    defaultHidden: true,
  },
  {
    path: "priority_description",
    label: "Priority",
    sortable: true,
    defaultHidden: true,
  },
  {
    path: "master_incident_number",
    label: "Incident number",
    sortable: true,
  },
  {
    path: "is_cancelled_call",
    label: "Canceled call",
    sortable: true,
    valueFormatter: formatYesNoString,
    defaultHidden: true,
  },
  {
    path: "in_austin_full_purpose",
    label: "In Austin Full Purpose",
    sortable: true,
    defaultHidden: true,
    valueFormatter: formatYesNoString,
  },
  {
    path: "location_id",
    label: "Location ID",
    sortable: true,
    defaultHidden: true,
  },
];

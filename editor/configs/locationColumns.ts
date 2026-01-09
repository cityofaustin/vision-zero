import { ColDataCardDef } from "@/types/types";
import { Location } from "@/types/locations";
import { formatArrayToString, formatDollars } from "@/utils/formatters";

export const locationColumns = {
  location_id: {
    path: "location_id",
    label: "Location ID",
  },
  cr3_crash_count: {
    path: "locations_list_view.cr3_crash_count",
    label: "CR3 crashes (5 years)",
  },
  non_cr3_crash_count: {
    path: "locations_list_view.non_cr3_crash_count",
    label: "Non-CR3 crashes (5 years)",
  },
  total_est_comp_cost: {
    path: "locations_list_view.total_est_comp_cost",
    label: "Est. comprehensive cost (5 years)",
    valueFormatter: formatDollars,
  },
  street_level: {
    path: "street_levels",
    label: "ASMP Street level(s)",
    valueFormatter: formatArrayToString,
  },
} satisfies Record<string, ColDataCardDef<Location>>;

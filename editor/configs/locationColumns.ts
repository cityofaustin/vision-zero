import { ColDataCardDef } from "@/types/types";
import { Location } from "@/types/locations";
import {
  formatArrayToString,
  formatDollars,
  formatYesNoString,
} from "@/utils/formatters";

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
  apd_sectors: {
    path: "apd_sectors",
    label: "APD sector(s)",
    sortable: false,
    defaultHidden: false,
    valueFormatter: formatArrayToString,
  },
  area_eng_areas: {
    path: "area_eng_areas",
    label: "Area engineer",
    sortable: false,
    valueFormatter: formatArrayToString,
  },
  signal_eng_areas: {
    path: "signal_eng_areas",
    label: "Signal engineer",
    sortable: false,
    valueFormatter: formatArrayToString,
  },
  council_districts: {
    path: "council_districts",
    label: "Council district(s)",
    sortable: false,
    valueFormatter: formatArrayToString,
  },
  is_hin: {
    path: "is_hin",
    label: "High injury network",
    sortable: true,
    defaultHidden: false,
    valueFormatter: formatYesNoString,
  },
  is_signalized: {
    path: "is_signalized",
    label: "Signalized",
    sortable: true,
    defaultHidden: false,
    valueFormatter: formatYesNoString,
  },
} satisfies Record<string, ColDataCardDef<Location>>;

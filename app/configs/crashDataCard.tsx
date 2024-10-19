import { Crash, TableColumn } from "@/types/types";

export const crashDataCardColumns: TableColumn<Crash>[] = [
  {
    key: "address_primary",
    label: "Address",
  },
  {
    key: "crash_timestamp",
    label: "Crash date",
  },
  {
    key: "rpt_street_name",
    label: "Street name",
    editable: true,
  },
  {
    key: "crash_speed_limit",
    label: "Speed limit",
    editable: true,
  },
];

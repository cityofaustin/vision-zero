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
    inputType: "text",
  },
  {
    key: "crash_speed_limit",
    label: "Speed limit",
    editable: true,
    inputType: "number",
  },
  {
    key: "fhe_collsn_id",
    label: "Collision type",
    editable: true,
    inputType: "select",
    relationshipName: "collsn",
    lookupTable: {
      tableSchema: "lookups",
      tableName: "collsn",
    },
  },
  {
    key: "at_intrsct_fl",
    label: "At intersection",
    editable: true,
    inputType: "yes_no"
  }
];

import { formatIsoDateTimeWithDay } from "@/utils/formatters";

export const fatalCrashColumns = {
  crash_timestamp: {
    path: "crash_timestamp",
    label: "Crash date",
    valueFormatter: formatIsoDateTimeWithDay,
  },
  collsn: {
    path: "collsn.label",
    label: "Collision type",
    relationship: {
      tableSchema: "lookups",
      tableName: "collsn",
      idColumnName: "id",
      labelColumnName: "label",
      foreignKey: "fhe_collsn_id",
    },
  },
  is_coa_roadway: {
    path: "is_coa_roadway",
    label: "Roadway owner",
    valueFormatter: (value: boolean) => {
      return value === true ? "City of Austin" : "TxDOT";
    },
  },
};

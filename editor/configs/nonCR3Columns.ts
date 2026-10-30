import { ColDataCardDef } from "@/types/types";
import { NonCR3Record } from "@/types/nonCr3";
import { formatIsoDateTime } from "@/utils/formatters";

export const nonCR3Columns = {
  address: {
    path: "address",
    label: "Address",
    sortable: true,
  },
  case_timestamp: {
    path: "case_timestamp",
    label: "Crash date",
    sortable: true,
    valueFormatter: formatIsoDateTime,
  },
  case_id: {
    path: "case_id",
    label: "Case ID",
    sortable: true,
  },
} satisfies Record<string, ColDataCardDef<NonCR3Record>>;

import { ColDataCardDef } from "@/types/types";
import { NonCR3Record } from "@/types/nonCr3";

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
  },
  case_id: {
    path: "case_id",
    label: "Case ID",
    sortable: true,
  },
} satisfies Record<string, ColDataCardDef<NonCR3Record>>;

export const emsNonCR3Columns = [
  nonCR3Columns.address,
  nonCR3Columns.case_timestamp,
  nonCR3Columns.case_id,
];

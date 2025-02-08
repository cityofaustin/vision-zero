import { ColDataCardDef } from "@/types/types";
import { Charge } from "@/types/charge";

export const ALL_CHARGE_COLUMNS = {
  unit_nbr: {
    path: "unit_nbr",
    label: "Unit",
  },
  prsn_nbr: {
    path: "prsn_nbr",
    label: "Person",
  },
  charge: {
    path: "charge",
    label: "Charge",
  },
  citation_nbr: {
    path: "citation_nbr",
    label: "Citation Number",
  },
} satisfies Record<string, ColDataCardDef<Charge>>;

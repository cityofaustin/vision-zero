import { ColDataCardDef } from "@/types/types";
import { Charge } from "@/types/charge";

export const ALL_CHARGE_COLUMNS: { [name: string]: ColDataCardDef<Charge> } = {
  unit_nbr: {
    name: "unit_nbr",
    label: "Unit",
  },
  prsn_nbr: {
    name: "prsn_nbr",
    label: "Person",
  },
  charge: {
    name: "charge",
    label: "Charge",
  },
  citation_nbr: {
    name: "citation_nbr",
    label: "Citation Number",
  },
};

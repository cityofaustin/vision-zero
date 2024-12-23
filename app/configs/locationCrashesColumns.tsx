import { ColDataCardDef } from "@/types/types";
import { LocationCrashRow } from "@/types/locationCrashes";

export const locationCrashesColumns: ColDataCardDef<LocationCrashRow>[] = [
  {
    path: "type",
    label: "Type",
  },
  {
    path: "address_primary",
    label: "Primary address",
  },
  {
    path: "address_secondary",
    label: "Secondary address",
  },
  {
    path: "case_id",
    label: "Case ID",
  },
  {
    path: "collsn_desc",
    label: "Collision type",
  },
];

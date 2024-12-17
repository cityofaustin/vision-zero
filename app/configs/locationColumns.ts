import { ColDataCardDef } from "@/types/types";
import { Location } from "@/types/locations";

export const locationColumns: {
  [name: string]: ColDataCardDef<Location>;
} = {
  location_id: {
    path: "location_id",
    label: "Location ID",
  },
  cr3_crash_count: {
    path: "locations_list_view.cr3_crash_count",
    label: "CR3 Crashes (Previous 5 years)",
  },
};

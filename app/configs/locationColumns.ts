import { ColDataCardDef } from "@/types/types";
import { Location } from "@/types/locations";

export const locationColumns: {
  [name: string]: ColDataCardDef<Location>;
} = {
  location_id: {
    name: "location_id",
    label: "Location ID",
  },
  // todo: need to support non-lookup table relationships
  //   cr3_crash_count: {
  //     name: "cr3_crash_count",
  //     relationshipName: "locations_list_view"
  //   }
};

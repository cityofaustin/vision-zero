import Link from "next/link";
import { ColDataCardDef } from "@/types/types";
import { LocationsListRow } from "@/types/locationsList";

export const locationsListViewColumns: ColDataCardDef<LocationsListRow>[] = [
  {
    path: "location_id",
    label: "Location ID",
    sortable: true,
    valueRenderer: (record: LocationsListRow) => (
      <Link href={`/locations/${record.location_id}`}>
        {record.location_id}
      </Link>
    ),
  },
  {
    path: "location_name",
    label: "Location",
    sortable: true,
  },
  {
    path: "cr3_crash_count",
    label: "CR3 crashes",
    sortable: true,
  },
  {
    path: "non_cr3_crash_count",
    label: "Non-CR3 crashes",
    sortable: true,
  },
];

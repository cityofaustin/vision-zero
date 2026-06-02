import Link from "next/link";
import { ColDataCardDef } from "@/types/types";
import { LocationsListRow } from "@/types/locationsList";
import { locationColumns } from "@/configs/locationColumns";

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
    style: {
      maxWidth: "30rem",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
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
  locationColumns.area_eng_areas,
  locationColumns.signal_eng_areas,
  locationColumns.is_signalized,
  locationColumns.council_districts,
  { ...locationColumns.street_level, defaultHidden: true },
  { ...locationColumns.apd_sectors, defaultHidden: true },
  { ...locationColumns.is_hin, defaultHidden: true },
];

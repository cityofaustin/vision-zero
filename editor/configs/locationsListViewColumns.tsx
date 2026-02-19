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
  {
    path: "apd_sectors",
    label: "APD sector(s)",
    sortable: false,
    defaultHidden: true,
  },
  {
    path: "area_eng_areas",
    label: "Area engineer",
    sortable: false,
  },
  {
    path: "signal_eng_areas",
    label: "Signal engineer",
    sortable: false,
  },
  {
    path: "council_districts",
    label: "Council district(s)",
    sortable: false,
  },
  {
    path: "is_hin",
    label: "High injury network location",
    sortable: true,
    defaultHidden: true,
  },
  {
    path: "is_signalized",
    label: "Signalized",
    sortable: true,
    defaultHidden: true,
  },
  {
    path: "location_group",
    label: "Location group",
    sortable: true,
    defaultHidden: true,
  },
  {
    path: "street_levels",
    label: "Street levels",
    sortable: false,
    defaultHidden: true,
  },
];

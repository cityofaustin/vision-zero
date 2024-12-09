import Link from "next/link";
import { ColDataCardDef } from "@/types/types";
import { LocationsListRow } from "@/types/locationsList";
import { renderNumber } from "@/utils/formHelpers";

export const locationsListViewColumns: ColDataCardDef<LocationsListRow>[] =
  [
    {
      name: "location_id",
      label: "Location ID",
      sortable: true,
      valueRenderer: (record: LocationsListRow) => (
        <Link href={`/locations/${record.location_id}`}>
          {record.location_id}
        </Link>
      ),
    },
    {
      name: "description",
      label: "Location",
      sortable: true,
    },
    {
      name: "cr3_crash_count",
      label: "CR3 crashes",
      sortable: true,
      valueFormatter: renderNumber,
    },
    {
      name: "non_cr3_crash_count",
      label: "Non-CR3 crashes",
      sortable: true,
      valueFormatter: renderNumber,
    },
  ];

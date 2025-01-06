import Link from "next/link";
import { formatDate } from "@/utils/formatters";
import { ColDataCardDef } from "@/types/types";
import { Crash } from "@/types/crashes";

export const tempCrashesListViewColumns: ColDataCardDef<Crash>[] = [
  {
    path: "record_locator",
    label: "Crash ID",
    sortable: true,
    valueRenderer: (record: Crash) => (
      <Link href={`/crashes/${record.record_locator}`}>
        {record.record_locator}
      </Link>
    ),
  },
  {
    path: "case_id",
    label: "Case ID",
    sortable: true,
  },
  {
    path: "crash_timestamp",
    label: "Date",
    sortable: true,
    valueFormatter: formatDate,
  },
  {
    path: "address_primary",
    label: "Address",
    sortable: true,
  },
  {
    path: "updated_by",
    label: "Updated by",
    sortable: true,
  },
  {
    path: "updated_at",
    label: "Updated at",
    sortable: true,
    valueFormatter: formatDate,
  },
];

import Link from "next/link";
import { formatDate } from "@/utils/formatters";
import { ColDataCardDef } from "@/types/types";
import { CrashesListRow } from "@/types/crashesList";

export const crashesListViewColumns: ColDataCardDef<CrashesListRow>[] = [
  {
    path: "record_locator",
    label: "Crash ID",
    sortable: true,
    valueRenderer: (record: CrashesListRow) => (
      <Link href={`/crashes/${record.record_locator}`} prefetch={false}>
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
    path: "collsn_desc",
    label: "Collision",
    sortable: true,
  },
];

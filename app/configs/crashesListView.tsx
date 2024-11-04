import Link from "next/link";
import { CrashListCrash, ColDataCardDef } from "@/types/types";
import { formatDateTime } from "@/utils/formatters";

export const crashesListViewColumns: ColDataCardDef<CrashListCrash>[] = [
  //   {
  //     name: "id",
  //     label: "ID",
  //   },
  {
    name: "record_locator",
    label: "Crash ID",
    sortable: true,
    valueRenderer: (record: CrashListCrash) => (
      <Link href={`/crashes/${record.record_locator}`}>
        {record.record_locator}
      </Link>
    ),
  },
  {
    name: "case_id",
    label: "Case ID",
    sortable: true,
  },
  {
    name: "crash_timestamp",
    label: "Date",
    sortable: true,
    valueFormatter: formatDateTime,
  },
  {
    name: "address_primary",
    label: "Address",
    sortable: true,
  },
  {
    name: "collsn_desc",
    label: "Collision",
    sortable: true,
  },
];

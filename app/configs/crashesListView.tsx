import Link from "next/link";
import { CrashListCrash, TableColumn } from "@/types/types";

export const crashesListViewColumns: TableColumn<CrashListCrash>[] = [
  {
    key: "id",
    label: "ID",
  },
  {
    key: "record_locator",
    label: "Crash ID",
    formatter: (row: CrashListCrash) => (
      <Link href={`/crashes/${row.record_locator}`}>{row.record_locator}</Link>
    ),
  },
  {
    key: "address_primary",
    label: "Address",
  },
];

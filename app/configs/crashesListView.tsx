import Link from "next/link";
import { CrashListCrash, ColDataCardDef } from "@/types/types";

export const crashesListViewColumns: ColDataCardDef<CrashListCrash>[] = [
  {
    name: "id",
    label: "ID",
  },
  {
    name: "record_locator",
    label: "Crash ID",
    formatter: (row: CrashListCrash) => (
      <Link href={`/crashes/${row.record_locator}`}>{row.record_locator}</Link>
    ),
  },
  {
    name: "address_primary",
    label: "Address",
  },
];

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
    valueRenderer: (record: CrashListCrash) => (
      <Link href={`/crashes/${record.record_locator}`}>
        {record.record_locator}
      </Link>
    ),
  },
  {
    name: "address_primary",
    label: "Address",
  },
];

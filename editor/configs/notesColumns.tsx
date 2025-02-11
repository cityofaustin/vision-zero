import { formatDate } from "@/utils/formatters";
import { ColDataCardDef } from "@/types/types";
import { CrashNote } from "@/types/crashNote";
import { LocationNote } from "@/types/locationNote";

export const crashNotesColumns: ColDataCardDef<CrashNote>[] = [
  {
    path: "created_at",
    label: "Created at",
    editable: false,
    valueFormatter: formatDate,
  },
  {
    path: "updated_by",
    label: "Updated by",
    editable: false,
  },
  {
    path: "text",
    label: "Note",
    editable: true,
    inputType: "textarea",
    style: { minWidth: "350px" },
  },
];

export const locationNotesColumns: ColDataCardDef<LocationNote>[] = [
  {
    path: "created_at",
    label: "Created at",
    editable: false,
    valueFormatter: formatDate,
  },
  {
    path: "updated_by",
    label: "Updated by",
    editable: false,
  },
  {
    path: "text",
    label: "Note",
    editable: true,
    inputType: "textarea",
    style: { minWidth: "350px" },
  },
];

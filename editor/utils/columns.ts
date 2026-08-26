import { ColDataCardDef } from "@/types/types";

/**
 * Make an array of columns read-only by overriding their `editable` prop
 */
export function makeReadOnly<T extends Record<string, unknown>>(
  columns: ColDataCardDef<T>[]
): ColDataCardDef<T>[] {
  return columns.map((col) => ({ ...col, editable: false }));
}

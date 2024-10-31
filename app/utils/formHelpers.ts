import { ColDataCardDef, LookupTableOption } from "@/types/types";

/**
 * Convert a record value to a string so that it can be used as the initial value
 * in a form input
 */
export const valueToString = (
  value: unknown,
  col: ColDataCardDef<any>
): string => {
  if (col.inputType === "yes_no") {
    return valueToBoolString(value);
  }
  return String(value || "");
};

/**
 * Convert "true" to `true`, any other non-empty string to `false`
 * and anything falsey to `null`
 */
export const stringToBoolNullable = (value: string): boolean | null =>
  value ? value === "true" : null;

/**
 * Convert null to an empty string and anything else to "true" or "false.
 *
 * Use this as the input value handler for yes/no select inputs
 */
const valueToBoolString = (value: unknown): "true" | "false" | "" =>
  value === null ? "" : value ? "true" : "false";

/**
 * Trim string and coerce falsey values to `null`
 */
export const trimStringNullable = (value: string): string | null => {
  return value.trim() || null;
};

/**
 * Convert strings to numbers and coerce non-zero falsey values to `null`.
 * Invalid (NaN) numbers are also converted to null.
 */
export const stringToNumberNullable = (value: string): number | null => {
  if (value.trim() === "") {
    return null;
  }
  let num = Number(value);
  if (isNaN(num)) {
    // todo: handle this
    console.warn("Failed to convert value to number: ", value);
    return null;
  }
  return num;
};

/**
 * Convert truthy values to 'Yes', `null` and `undefined` to "", and
 * any other falsey value to "No"
 */
const renderYesNoString = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return value ? "Yes" : "No";
};

/**
 * Render any value as a string, coercing falsey values to ""
 */
const renderString = (value: unknown) => String(value || "");

/**
 * Generic accessor function that returns a record property. It uses the
 * column's valueGetter (if present) otherwise record[column.name];
 */
export const getRecordValue = <T extends Record<string, unknown>>(
  record: T,
  column: ColDataCardDef<T>
): unknown => {
  if (column.valueGetter) {
    return column.valueGetter(record, column);
  }
  // todo: this should be predefined valuegetter
  //   if (column.relationshipName) {
  //     const relatedObject = record[column.relationshipName] as LookupTableOption;
  //     return relatedObject?.id;
  //   }
  return record[column.name];
};

/**
 * Render a static column value (e.g., in a table cell)
 *
 * Todo: this should be moved to a util
 */
export const renderValue = <T extends {}>(
  record: T,
  column: ColDataCardDef<T>
) => {
  if (column.valueRenderer) {
    return column.valueRenderer(record, column);
  }
  if (column.valueFormatter) {
    return column.valueFormatter(
      getRecordValue(record, column),
      record,
      column
    );
  }
  // todo: these should probably be valueFormatter's? 😵‍💫
  if (column.relationshipName) {
    const relatedObject = record[column.relationshipName] as LookupTableOption;
    return relatedObject?.label;
  }

  if (column.inputType === "yes_no") {
    const value = record[column.name];
    if (value === null) return "";
    return value ? "Yes" : "No";
  }

  return String(record[column.name] || "");
};

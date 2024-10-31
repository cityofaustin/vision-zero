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
export const getRecordValue = <T>(
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
 * Render a static field value (e.g., in a table cell)
 * -- todo: this will be used by the table component as well
 * -- todo: this needs to be updated + reconsidered based
 * on formatters that are avail. also see getRecordValue
 * and of course col.renderer
 */
// export const renderValue = (value: unknown, col: ColDataCardDef<any>) => {
//   throw `agh this is messed uppp`;
//   if (col.inputType === "yes_no") {
//     return renderYesNoString(value);
//   }
//   return col.renderer ? col.renderer(value) : String(value || "");
// };

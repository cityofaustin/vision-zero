import { ReactNode } from "react";
import { ColDataCardDef, InputType } from "@/types/types";
import { LookupTableOption } from "@/types/lookupTables";
import { Path } from "@/types/utils";

/**
 * Retrieve a value from an object from a given path using dot notation
 *
 * todo: is this actually typesafe lol
 */
export const getFromPath = <T extends Record<string, unknown>>(
  obj: T,
  path: Path<T>
): unknown => {
  // todo: what about nulls/undefined?
  return path.split(".").reduce((previousValue: unknown, pathPart: string) => {
    if (
      previousValue &&
      typeof previousValue === "object" &&
      pathPart in previousValue
    ) {
      return previousValue[pathPart as keyof typeof previousValue];
    }
    // todo: should never reach here - not sure how to handle since returning undefined
    return undefined;
  }, obj);
};

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
const stringToBoolNullable = (value: string): boolean | null =>
  value ? value === "true" : null;

/**
 * Convert null to an empty string and anything else to "true" or "false".
 *
 * Use this as the input value handler for yes/no select inputs
 */
const valueToBoolString = (value: unknown): "true" | "false" | "" =>
  value === null ? "" : value ? "true" : "false";

/**
 * Trim string and coerce falsey values to `null`
 */
const trimStringNullable = (value: string): string | null => {
  return value.trim() || null;
};

/**
 * Convert strings to numbers and coerce non-zero falsey values to `null`.
 * Invalid (NaN) numbers are also converted to null.
 */
const stringToNumberNullable = (value: string): number | null => {
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
 * Stringify an unknown value and coerce null and undefined to empty string
 *
 * @example
 * // returns "a"
 * renderValueToString("a")
 *
 * // returns "0"
 * renderValueToString(0)
 *
 * @example
 * // returns "false"
 * renderValueToString(false)
 *
 * @example
 * // returns "[object Object]"
 * renderValueToString({ a: "1"})
 */
const renderValueToString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
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
 * Return the `label` column from a related lookup table
 */
export const renderLookupLabel = <T extends Record<string, unknown>>(
  record: T,
  column: ColDataCardDef<T>
): string => {
  if (column.relationshipName) {
    const relatedObject = record[column.relationshipName] as LookupTableOption;
    return relatedObject?.label;
  }
  return "";
};

/**
 * Get a value from a record given its column. Uses the column's valueGetter (if present),
 * otherwise column.path is used.
 */
export const getRecordValue = <T extends Record<string, unknown>>(
  record: T,
  column: ColDataCardDef<T>
): unknown => {
  // todo: valueGetter not in use anywhere - can remove?
  if (column.valueGetter) {
    return column.valueGetter(record, column);
  } else if (!column.path.includes(".")) {
    // simple object accessor
    return record[column.path];
  }
  // handle dot notation
  return getFromPath(record, column.path);
};

/**
 * Render a column's value (e.g., in a table cell).
 *
 * The rendered output resolves in the following order:
 *
 * ```
 * column.valueRenderer()
 * column.valueFormatter()
 * column.valueGetter()
 * record[column.path]
 * ```
 */
export const renderColumnValue = <T extends Record<string, unknown>>(
  record: T,
  column: ColDataCardDef<T>
): ReactNode => {
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
    return renderLookupLabel(record, column);
  }

  if (column.inputType === "yes_no") {
    return renderYesNoString(record[column.path]);
  }

  return renderValueToString(getRecordValue(record, column));
};

/**
 * Function which transforms form input string into the value
 * that will be sent in the the db mutation
 *
 * todo: wrap this in a try/catch and use form validation
 */
export const handleFormValueOutput = (
  value: string,
  isLookup: boolean,
  inputType?: InputType
): unknown | null | boolean => {
  if (inputType === "yes_no") {
    return stringToBoolNullable(value);
  }
  if (inputType === "number" || (inputType === "select" && isLookup)) {
    return stringToNumberNullable(value);
  }
  // handle everything else as a nulllable string
  return trimStringNullable(value);
};

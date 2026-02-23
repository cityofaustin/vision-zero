import { ReactNode } from "react";
import { ColDataCardDef, InputType } from "@/types/types";
import { formatYesNoString } from "@/utils/formatters";

/**
 * Retrieve a value from an object given a dot-noted path string.
 *
 * Essentially, it performs optional chaining on an object. It is similar
 * to lodash.get(), except array notation is not supported.
 *
 * @example
 * // returns "Austin"
 * getFromPath({ city: { label: "Austin" } }, "city.label" )
 */
export function getFromPath(
  obj: Record<string, unknown>,
  path: string
): unknown {
  return path.split(".").reduce((currentValue: unknown, key: string) => {
    if (currentValue != null && typeof currentValue === "object") {
      return (currentValue as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Convert a record value to a string so that it can be used as the initial value
 * in a form input
 */
export const valueToString = <T extends Record<string, unknown>>(
  value: unknown,
  col: ColDataCardDef<T>
): string => {
  if (col.inputType === "yes_no") {
    return valueToBoolString(value);
  }
  if (value === 0) return "0";
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
 * Stringify an unknown value and coerce null and undefined to empty string
 *
 * @example
 * // returns "a"
 * renderValueToString("a")
 *
 * // returns "0"
 * renderValueToString(0)
 *
 * // returns "false"
 * renderValueToString(false)
 *
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
 * Get a columns's value from a record
 * @param record - the record object
 * @param column - the column definition
 * @param useForeignKeyIfExists - if true and a Relationship is available,
 * return the value of the relationship's foreign key
 */
export const getRecordValue = <T extends Record<string, unknown>>(
  record: T,
  column: ColDataCardDef<T>,
  useForeignKeyIfExists?: boolean
): unknown => {
  if (useForeignKeyIfExists && column.relationship?.foreignKey) {
    // access the current foreign key - for when a relationship is
    // being edited
    return record[column.relationship?.foreignKey];
  }
  if (!column.path.includes(".")) {
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

  if (column.inputType === "yes_no") {
    return formatYesNoString(record[column.path]);
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
    if (!value) return null;
    // Strip any non-numeric characters except decimal point and negative sign
    const sanitizedValue = value.replace(/[^\d.-]/g, "");
    const parsedValue = parseFloat(sanitizedValue);
    return isNaN(parsedValue) ? null : parsedValue;
  }

  return trimStringNullable(value);
};

/**
 * Generates validation rules for EditableField based on column definition
 */
export const commonValidations = {
  isNumber: (value: string) => {
    // Allow empty string for nullable fields
    if (!value) return true;
    return /^\d+$/.test(value) || "This field must be a number";
  },
  isNullableInteger: (value: string) => {
    // Allow empty string for nullable fields
    if (!value) return true;

    // Trim leading/trailing whitespace and test if it's a positive integer
    const trimmed = value.trim();
    if (!/^\d+$/.test(trimmed)) {
      return "Must be a positive integer";
    }
    return true;
  },
  isNullableZipCode: (value: string) => {
    // Allow empty string for nullable fields
    if (!value) return true;

    // Trim leading/trailing whitespace and test against ZIP code pattern
    // Allows 5 digits or 5 digits followed by optional hyphen and 4 digits
    const trimmed = value.trim();
    if (!/^\d{5}(-\d{4})?$/.test(trimmed)) {
      return "Not a valid zip code";
    }
    return true;
  },
};

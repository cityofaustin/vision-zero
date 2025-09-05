import { ReactNode } from "react";
import { Variables } from "graphql-request";
import { Relationship } from "./relationships";
import { Path } from "./utils";
import { RegisterOptions } from "react-hook-form";

export type InputType = "text" | "number" | "yes_no" | "select" | "textarea";

/**
 * Metadata for a database column referenced by our app — where
 * <T> should be one of our core record types (Crash, Person, etc).
 *
 * These properties control how a column is rendered and edited
 * in various UI components
 */
export interface ColDataCardDef<T extends Record<string, unknown>> {
  /**
   * the dot-notated string path to accessing the property on the given type,
   * or "actions" for special action buttons column
   */
  path: Path<T>;
  /**
   * label which will be rendered wherever this value is displayed in the app
   */
  label: string;
  /**
   * If the column is editable
   */
  editable?: boolean;
  /**
   * If the field should be hidden from the UI by default - only affects
   * when the column is used in a component which supports toggling
   * column visibility
   */
  defaultHidden?: boolean;
  /**
   * If the field should only be available in the exported table data -
   * only affects when column is used in a table config
   */
  exportOnly?: boolean;
  /**
   * Always include this column in graphql queries, regardless of if it is
   * hidden or exportOnly. Enables us to include data that our code depends on
   * but is not necessarily rendered, e.g. lat/lon
   */
  fetchAlways?: boolean;
  /**
   * Determines the UI component that will be used to edit the column
   */
  inputType?: InputType;
  /**
   * Lookup table metadata, which is used to fetch lookup values
   * and update the foreign key column when editing
   */
  relationship?: Relationship<T>;
  sortable?: boolean;
  /**
   * Function which formats a column value as a string. See formHelpers.getRecordValue()
   * as an example of how the column value arg is supplied
   */
  valueFormatter?: (
    value: unknown,
    record: T,
    column: ColDataCardDef<T>
  ) => string;
  /**
   * Function which returns a ReactNode given an input record and column definition.
   * Enables custom value accessing and rendering.
   */
  valueRenderer?: (record: T, column: ColDataCardDef<T>) => ReactNode;
  /**
   * Function that returns a custom component, used for display and/or editing
   * when the column is dependent on other columns of the same record
   */
  customEditComponent?: (
    record: T,
    onCancel: () => void,
    mutation: string,
    onSaveCallback?: () => Promise<void>
  ) => ReactNode;
  /**
   * Styles to be applied to the component's containing element
   */
  style?: React.CSSProperties;
  /**
   * Additional input validation options that mirror react-hook-form RegisterOptions
   *
   * @see https://react-hook-form.com/docs/useform/register
   */
  inputOptions?: RegisterOptions<FormValues, "value">;

  /** Function that gets the message to be displayed in the case of a graphql mutation error */
  getMutationErrorMessage?: (error: unknown) => string | null;
}

export interface MutationVariables extends Variables {
  [key: string]: unknown;
  updates?: {
    [key: string]: unknown;
    updated_by?: string;
  };
}

export interface FormValues {
  // Represents the structure of form data, specifically for forms that
  // require a single string value. This interface can be used with
  // form libraries like react-hook-form to ensure type safety and
  // consistency when handling form submissions.
  value: string;
}

/**
 * Interface for column visibility picker state
 */
export interface ColumnVisibilitySetting {
  path: string;
  label: string;
  isVisible: boolean;
}

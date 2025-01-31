import { ReactNode } from "react";
import { Variables } from "graphql-request";
import { Relationship } from "./relationships";
import { Path } from "./utils";

export type InputType = "text" | "number" | "yes_no" | "select";

/**
 * Metadata for a database column referenced by our app — where
 * <T> should be one of our core record types (Crash, Person, etc).
 *
 * These properties control how a column is rendered and edited
 * in various UI components
 */
export interface ColDataCardDef<T extends Record<string, unknown>> {
  /**
   * the dot-notated string path to accessing the property on the given type
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
   * If the field should only be available in the exported table data -
   * only affects when column is used in a table config
   */
  exportOnly?: boolean;
  /**
   * Determines the UI component that will be used to edit the column
   */
  inputType?: InputType;
  /**
   * Lookup table metadata, which is used to fetch lookup values
   * and update the foreign key column with editing
   */
  relationship?: Relationship<T>;
  sortable?: boolean;
  valueFormatter?: (
    value: unknown,
    record: T,
    column: ColDataCardDef<T>
  ) => string;
  valueRenderer?: (record: T, column: ColDataCardDef<T>) => ReactNode;
  /**
   * Function that returns a custom component, used for display and/or editing
   * when the column is dependent on other columns of the same record
   */
  customEditComponent?: (
    record: T,
    onCancel: () => void,
    mutation: string,
    onSaveCallback: () => Promise<void>
  ) => ReactNode;
  /**
   * Styles to be applied to the component's containing element
   */
  style?: React.CSSProperties;
}

export interface MutationVariables extends Variables {
  [key: string]: any;
  updates?: {
    [key: string]: any;
    updated_by?: string;
  };
}

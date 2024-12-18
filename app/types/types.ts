import { ReactNode } from "react";
import { Variables } from "graphql-request";
import { LookupTableDef } from "./lookupTables";
import { Path } from "./utils";

export type InputType = "text" | "number" | "yes_no" | "select";

/**
 * The base definition of a database column referenced by our app — where
 * <T> should be one of our core record types (Crash, Person, etc)
 */
export type ColBaseDef<T extends Record<string, unknown>> = {
  /**
   * the dot-notated string path to accessing the property on the given type
   */
  path: Path<T>;
  /**
   * label which will be rendered wherever this value is displayed in the app
   */
  label: string;
};

/**
 * Type which defines metadata for a single property of a record so that it can be
 * accessed, rendered, and edited in various UI components
 */
export interface ColDataCardDef<T extends Record<string, unknown>>
  extends ColBaseDef<T> {
  editable?: boolean;
  inputType?: InputType;
  lookupTable?: LookupTableDef;
  relationshipName?: keyof T;
  sortable?: boolean;
  valueGetter?: (record: T, column: ColDataCardDef<T>) => unknown;
  valueFormatter?: (
    value: unknown,
    record: T,
    column: ColDataCardDef<T>
  ) => string;
  valueRenderer?: (record: T, column: ColDataCardDef<T>) => ReactNode;
}

export interface MutationVariables extends Variables {
  [key: string]: any;
  updates?: {
    [key: string]: any;
    updated_by?: string;
  };
}

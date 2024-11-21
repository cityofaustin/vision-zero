import { ReactNode } from "react";
import { Variables } from "graphql-request";
import { LookupTableDef } from "./lookupTables";

export type InputType = "text" | "number" | "yes_no" | "select";

/**
 * The base definition of a database column referenced by our app — where
 * <T> should be one of our core record types (Crash, Person, etc)
 */
export type ColBaseDef<T extends Record<string, unknown>> = {
  /**
   * the column name in the database
   */
  name: keyof T;
  /**
   * label which will be rendered wherever this value is displayed in the app
   */
  label: string;
};

export interface ColDataCardDef<T extends Record<string, unknown>>
  extends ColBaseDef<T> {
  editable?: boolean;
  inputType?: InputType;
  lookupTable?: LookupTableDef;
  relationshipName?: keyof T;
  sortable?: boolean;
  valueGetter?: (record: T, column: ColDataCardDef<T>) => any;
  valueFormatter?: (value: any, record: T, column: ColDataCardDef<T>) => string;
  valueRenderer?: (record: T, column: ColDataCardDef<T>) => ReactNode;
}

export interface MutationVariables extends Variables {
  [key: string]: any;
  updates?: {
    [key: string]: any;
    updated_by?: string;
  };
}

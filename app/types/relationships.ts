/**
 * Relationship table metadata, which is used to:
 *  - fetch and update lookup values
 *  - fetch and update other related records
 */
export interface Relationship<T extends Record<string, unknown>> {
  /**
   * The foreign table name
   */
  tableName: string;
  /**
   * The foreign table's schema
   */
  tableSchema: "public" | "lookups" | "geo";
  /**
   * The foreign key column
   */
  foreignKey: keyof T;
  /**
   * The ID column name referenced by the foreign key column. Should
   * uniquely identify a single lookup option
   */
  idColumnName: string;
  /**
   * The column to be used to label each lookup option
   */
  labelColumnName: string;
}

export type LookupTableOption = {
  id: string | number;
  label: string | number;
};

export interface LookupTableDef {
  tableSchema: "public" | "lookups";
  tableName: string;
}

export type LookupTableOption = {
  id: number;
  label: string;
};

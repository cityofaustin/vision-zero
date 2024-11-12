import { Dispatch, SetStateAction } from "react";
import BsTable from "react-bootstrap/Table";
import { ColDataCardDef } from "@/types/types";
import { renderColumnValue } from "@/utils/formHelpers";
import { QueryConfig } from "@/utils/queryBuilder";
import { FaSortDown, FaSortUp } from "react-icons/fa6";

export default function Table<T extends Record<string, unknown>>({
  rows,
  columns,
  queryConfig,
  setQueryConfig,
}: {
  rows: T[];
  columns: ColDataCardDef<T>[];
  queryConfig: QueryConfig;
  setQueryConfig: Dispatch<SetStateAction<QueryConfig>>;
}) {
  const SortIcon = queryConfig.sortAsc ? FaSortUp : FaSortDown;

  return (
    <BsTable responsive hover>
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={String(col.name)}
              style={{ cursor: col.sortable ? "pointer" : "auto" }}
              onClick={() => {
                if (col.sortable) {
                  const newQueryConfig = { ...queryConfig };
                  if (col.name === queryConfig.sortColName) {
                    // already sorting on this column, so switch order
                    newQueryConfig.sortAsc = !newQueryConfig.sortAsc;
                  } else {
                    // change sort column and leave order as-is
                    newQueryConfig.sortColName = String(col.name);
                  }
                  // reset offset/pagination
                  newQueryConfig.offset = 0;
                  setQueryConfig(newQueryConfig);
                }
              }}
            >
              {col.label}
              {col.name === queryConfig.sortColName && (
                <SortIcon className="ms-1 my-1" />
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              // todo: is no-wrap / side-scrolling ok?
              <td key={String(col.name)} style={{ whiteSpace: "nowrap" }}>
                {renderColumnValue(row, col)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </BsTable>
  );
}

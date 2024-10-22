import BsTable from "react-bootstrap/Table";
import { TableColumn } from "@/types/types";
import { getRecordValue } from "@/utils/formHelpers";
interface TableProps<T> {
  rows: T[];
  columns: TableColumn<T>[];
}
export default function Table<T>({ rows, columns }: TableProps<T>) {
  if (!rows) return <p>Loading or error...</p>;

  return (
    <BsTable striped responsive size="sm">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.key)}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={String(col.key)}>
                {col?.formatter
                  ? col.formatter(getRecordValue(row, col))
                  : String(getRecordValue(row, col))}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </BsTable>
  );
}

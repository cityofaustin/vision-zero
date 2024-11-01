import BsTable from "react-bootstrap/Table";
import { ColDataCardDef } from "@/types/types";
import { renderColumnValue } from "@/utils/formHelpers";

export default function Table<T extends Record<string, unknown>>({
  rows,
  columns,
}: {
  rows: T[];
  columns: ColDataCardDef<T>[];
}) {
  if (!rows) return <p>Loading or error...</p>;

  return (
    <BsTable striped responsive size="sm">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.name)}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={String(col.name)}>{renderColumnValue(row, col)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </BsTable>
  );
}

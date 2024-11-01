import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import RelatedRecordTableRow from "./RelatedRecordTableRow";
import { ColDataCardDef } from "@/types/types";

interface RelatedRecordTableProps<T extends Record<string, unknown>> {
  records: T[];
  columns: ColDataCardDef<T>[];
  mutation: string;
  isValidating: boolean;
  title: string;
  onSaveCallback: () => Promise<void>;
}

/**
 * Generic component which renders editable fields in a Card
 */
export default function RelatedRecordTable<T extends Record<string, unknown>>({
  records,
  columns,
  mutation,
  isValidating,
  title,
  onSaveCallback,
}: RelatedRecordTableProps<T>) {
  return (
    <Card>
      <Card.Header>{title}</Card.Header>
      <Card.Body>
        <Table striped hover>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={String(col.name)} style={{ textWrap: "nowrap" }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record, i) => (
              <RelatedRecordTableRow
                key={i}
                columns={columns}
                isValidating={isValidating}
                onSaveCallback={onSaveCallback}
                record={record}
                mutation={mutation}
              />
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

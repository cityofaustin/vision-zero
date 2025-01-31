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
  headerActionButton?: React.ReactNode;
  onSaveCallback: () => Promise<void>;
  mutationVariables?: (variables: {
    id: number;
    updates: Record<string, unknown>;
  }) => { id: number; updates: Record<string, unknown> };
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
  headerActionButton,
  onSaveCallback,
  mutationVariables,
}: RelatedRecordTableProps<T>) {
  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between">

        {title}
        {headerActionButton && headerActionButton}
        </div>
      </Card.Header>
      <Card.Body>
        <Table striped hover responsive>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={String(col.path)} style={{ textWrap: "nowrap" }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center" }}>
                  No {title.toLowerCase()} found
                </td>
              </tr>
            ) : (
              records.map((record, i) => (
                <RelatedRecordTableRow
                  key={i}
                  columns={columns}
                  isValidating={isValidating}
                  onSaveCallback={onSaveCallback}
                  record={record}
                  mutation={mutation}
                  mutationVariables={mutationVariables}
                />
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

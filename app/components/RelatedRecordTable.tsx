import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import RelatedRecordTableRow from "@/components/RelatedRecordTableRow";
import { ColDataCardDef } from "@/types/types";

interface RelatedRecordTableProps<T extends Record<string, unknown>> {
  /**
   * The records to be rendered in the table
   */
  records: T[];
  /**
   * The table's column definitions
   */
  columns: ColDataCardDef<T>[];
  /**
   * Graphql mutation that will be executed when a row is edited -
   * will also be passed to the rowActionComponent, if present
   */
  mutation: string;
  /**
   * If the SWR refetcher is (re)validating
   */
  isValidating: boolean;
  /**
   * The title to be rendered in the table's card header
   */
  title: string;
  /**
   * Optional React component to be rendered in the card's header
   */
  headerActionComponent?: React.ReactNode;
  /**
   * Optional react component to be rendered in the rightmost
   * column of every row
   */
  rowActionComponent?: React.ComponentType<RowActionComponentProps<T>>;
  /**
   * Callback function to be executed after a row edit is saved
   */
  onSaveCallback: () => Promise<void>;
}

export interface RowActionComponentProps<T extends Record<string, unknown>> {
  /**
   * The record in the current table row
   */
  record: T;
  /**
   * Graphql mutation that was provided to the parent RelatedRecordTable compoennt
   */
  mutation: string;
  /**
   * The callback function provided to the parent RelatedRecordTale component
   */
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
  headerActionComponent,
  onSaveCallback,
  rowActionComponent,
}: RelatedRecordTableProps<T>) {
  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between">
          {title}
          {!!headerActionComponent && headerActionComponent}
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
              {/* add an empty header for the row action */}
              {rowActionComponent && <th></th>}
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (rowActionComponent ? 1 : 0)}
                  style={{ textAlign: "center" }}
                >
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
                  rowActionComponent={rowActionComponent}
                />
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

import { useState } from "react";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import RelatedRecordTableRow from "@/components/RelatedRecordTableRow";
import TableColumnVisibilityMenu from "@/components/TableColumnVisibilityMenu";
import { useVisibleColumns } from "@/components/TableColumnVisibilityMenu";
import { ColDataCardDef } from "@/types/types";

interface RelatedRecordTableProps<
  T extends Record<string, unknown>,
  P extends Record<string, unknown> = Record<string, unknown>,
> {
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
   * Graphql mutation that will be passed to rowActionComponent, if present
   */
  rowActionMutation?: string;
  /**
   * If the SWR refetcher is (re)validating
   */
  isValidating: boolean;
  /**
   * Optional message to be rendered when the table has no rows
   */
  noRowsMessage?: string;
  /**
   * The card header to be rendered as a <Card.Title>
   */
  header: React.ReactNode;

  /**
   * Optional button component to be rendered in the rightmost of the card header,
   * left of the column visibility picker if there is one
   */
  headerButton?: React.ReactNode;

  /**
   * Show a column visibility picker
   */
  shouldShowColumnVisibilityPicker?: boolean;

  /**
   * Optional react component to be rendered in the rightmost
   * column of every row
   */
  rowActionComponent?: React.ComponentType<RowActionComponentProps<T, P>>;
  /**
   * Optional addition props to pass to the rowActionComponent
   */
  rowActionComponentAdditionalProps?: P;
  /**
   * Callback function to be executed after a row edit is saved
   */
  onSaveCallback: () => Promise<void>;

  /** The key to use when saving and loading table column visibility data to local storage.
   * Optional because not all tables have col visibility settings enabled */
  localStorageKey?: string;
}

export interface RowActionComponentProps<
  T extends Record<string, unknown>,
  P extends Record<string, unknown> = Record<string, unknown>,
> {
  /**
   * The record in the current table row
   */
  record: T;
  /**
   * Graphql mutation that was provided to the parent RelatedRecordTable component
   */
  mutation: string;
  /**
   * The callback function provided to the parent RelatedRecordTale component
   */
  onSaveCallback: () => Promise<void>;
  /**
   * Optional additional props passed to the component
   */
  additionalProps?: P;

  /**
   * Is a column in the row currently being edited
   */
  isEditingColumn?: boolean | null;
}

/**
 * Generic component which renders editable fields in a Card
 */
export default function RelatedRecordTable<
  T extends Record<string, unknown>,
  P extends Record<string, unknown> = Record<string, unknown>,
>({
  records,
  columns,
  mutation,
  rowActionMutation,
  isValidating,
  noRowsMessage,
  header,
  onSaveCallback,
  rowActionComponent,
  rowActionComponentAdditionalProps,
  headerButton,
  shouldShowColumnVisibilityPicker,
  localStorageKey,
}: RelatedRecordTableProps<T, P>) {
  const [
    isColVisibilityLocalStorageLoaded,
    setIsColVisibilityLocalStorageLoaded,
  ] = useState(false);

  /** Use custom hook to get array of visible columns, column visibility settings,
   * and state setter function */
  const {
    visibleColumns,
    columnVisibilitySettings,
    setColumnVisibilitySettings,
  } = useVisibleColumns(columns);

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        {typeof header === "string" ? (
          <Card.Title>{header}</Card.Title>
        ) : (
          <div>{header}</div>
        )}
        <div className="d-flex gap-2">
          {headerButton && headerButton}
          {shouldShowColumnVisibilityPicker && (
            <TableColumnVisibilityMenu
              columnVisibilitySettings={columnVisibilitySettings}
              setColumnVisibilitySettings={setColumnVisibilitySettings}
              localStorageKey={localStorageKey}
              isColVisibilityLocalStorageLoaded={
                isColVisibilityLocalStorageLoaded
              }
              setIsColVisibilityLocalStorageLoaded={
                setIsColVisibilityLocalStorageLoaded
              }
            ></TableColumnVisibilityMenu>
          )}
        </div>
      </Card.Header>
      <Card.Body>
        <Table hover responsive>
          <thead>
            <tr>
              {visibleColumns.map((col) => (
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
                  className="text-center text-secondary"
                >
                  {noRowsMessage ? noRowsMessage : "No records found"}
                </td>
              </tr>
            ) : (
              records.map((record, i) => (
                <RelatedRecordTableRow<T, P>
                  key={i}
                  columns={visibleColumns}
                  isValidating={isValidating}
                  onSaveCallback={onSaveCallback}
                  record={record}
                  mutation={mutation}
                  rowActionMutation={rowActionMutation}
                  rowActionComponent={rowActionComponent}
                  rowActionComponentAdditionalProps={
                    rowActionComponentAdditionalProps
                  }
                />
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

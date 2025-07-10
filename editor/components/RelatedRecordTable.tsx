import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import RelatedRecordTableRow from "@/components/RelatedRecordTableRow";
import TableSettingsMenu from "@/components/TableSettingsMenu";
import { ColDataCardDef } from "@/types/types";
import { useState } from "react";
import { ColumnVisibilitySetting } from "@/types/types";
import { useVisibleColumns } from "@/components/TableSettingsMenu";

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
   * Optional component to be rendered alongside the tite in the card header
   */
  headerComponent?: React.ReactNode;

  /**
   * Enable column visibility picker
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

  /** Use an empty string if table does not have column visibility settings */
  localStorageKey: string;
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
  headerComponent,
  shouldShowColumnVisibilityPicker,
  localStorageKey,
}: RelatedRecordTableProps<T, P>) {
  const [
    isColVisibilityLocalStorageLoaded,
    setIsColVisibilityLocalStorageLoaded,
  ] = useState(false);

  /**
   * Initialize column visibility from provided columns
   */
  const [columnVisibilitySettings, setColumnVisibilitySettings] = useState<
    ColumnVisibilitySetting[]
  >(
    columns
      .filter((col) => !col.exportOnly)
      .map((col) => ({
        path: String(col.path),
        isVisible: !col.defaultHidden,
        label: col.label,
      }))
  );

  /** Columns that should be visible based on user column visibility settings */
  const visibleColumns = useVisibleColumns(columns, columnVisibilitySettings);

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between">
          <Card.Title>{header}</Card.Title>
          <div className="d-flex justify-content-end gap-2">
            {headerComponent && headerComponent}
            {shouldShowColumnVisibilityPicker && (
              <TableSettingsMenu
                columnVisibilitySettings={columnVisibilitySettings}
                setColumnVisibilitySettings={setColumnVisibilitySettings}
                localStorageKey={localStorageKey}
                isColVisibilityLocalStorageLoaded={
                  isColVisibilityLocalStorageLoaded
                }
                setIsColVisibilityLocalStorageLoaded={
                  setIsColVisibilityLocalStorageLoaded
                }
              ></TableSettingsMenu>
            )}
          </div>
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

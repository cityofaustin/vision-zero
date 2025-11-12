import { useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Table from "react-bootstrap/Table";
import RelatedRecordTableRow from "@/components/RelatedRecordTableRow";
import TableColumnVisibilityMenu from "@/components/TableColumnVisibilityMenu";
import { useVisibleColumns } from "@/components/TableColumnVisibilityMenu";
import { ColDataCardDef } from "@/types/types";
import { compareNumbersAndBools, compareStrings } from "@/utils/sorting";
import { getRecordValue } from "@/utils/formHelpers";
import { FaSortDown, FaSortUp } from "react-icons/fa6";
import AlignedLabel from "@/components/AlignedLabel";

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
   * Function to generate the complete mutation variables payload
   * If not provided, uses default behavior
   */
  getMutationVariables?: (
    record: T,
    column: ColDataCardDef<T>,
    value: unknown,
    defaultVariables: { id: number; updates: Record<string, unknown> }
  ) => Record<string, unknown>;
  /**
   * Graphql mutation that will be passed to rowActionComponent, if present
   */
  rowActionMutation?: string;
  /**
   * If the SWR refetcher is (re)validating
   */
  isValidating?: boolean;
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
   * Whether to show a column visibility picker
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
  onSaveCallback?: () => Promise<void>;
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
   * Graphql mutation that was provided to the parent of RelatedRecordTable component
   */
  mutation: string;
  /**
   * The callback function provided to the parent of RelatedRecordTable component
   */
  onSaveCallback?: () => Promise<void>;
  /**
   * Optional additional props passed to the component
   */
  additionalProps?: P;

  /**
   * Is a column in the row currently being edited
   */
  isEditingColumn?: boolean | null;
}

interface SortSettings<T extends Record<string, unknown>> {
  col: null | ColDataCardDef<T>;
  asc: boolean;
}

const useSortedRows = <T extends Record<string, unknown>>({
  records,
  sortSettings,
  defaultCompareFunc,
}: {
  records: T[];
  sortSettings: SortSettings<T>;
  defaultCompareFunc: (a: unknown, b: unknown) => number;
}) =>
  useMemo(() => {
    const sortCol = sortSettings.col;
    if (!sortCol) {
      return records;
    }
    const compareFunc = sortCol.compareFunc
      ? sortCol.compareFunc
      : defaultCompareFunc;
    return records.toSorted((a, b) =>
      compareFunc(
        getRecordValue(sortSettings.asc ? a : b, sortCol),
        getRecordValue(sortSettings.asc ? b : a, sortCol)
      )
    );
  }, [records, sortSettings.asc, sortSettings.col]);

/**
 * Determines the default sort compare function to use based on
 * values in the data. It ignores null and undefined values and
 * otherwise falls back to compareStrings if all values are
 * not uniformly numbers or bools.
 */
const useDefaultCompareFunc = <T extends Record<string, unknown>>({
  records,
  sortSettings,
}: {
  records: T[];
  sortSettings: SortSettings<T>;
}) => {
  if (
    !records ||
    records.length === 0 ||
    sortSettings.col === null ||
    sortSettings.col.compareFunc
  ) {
    // nothing to do because there are no records, no sort column, or a compareFunc
    // is defined
    return compareStrings;
  }
  const col = sortSettings.col;
  const allValues = records.map((record) => getRecordValue(record, col));
  // get array of all types, ignoring null and undefined
  const allTypes = allValues
    .filter((val) => val !== undefined && val !== null)
    .map((value) => typeof value);
  // reduce array to unique types
  // @ts-ignore: todo: merge updated tsconfig with 2017 esm target
  const uniqueTypes = [...new Set(allTypes)];
  if (uniqueTypes.length > 0) {
    // mixed types: use string
    return compareStrings;
  } else if (uniqueTypes[0] === "number" || uniqueTypes[0] === "boolean") {
    return compareNumbersAndBools;
  } else {
    // sort strings and objects as objects
    return compareStrings;
  }
};

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
  getMutationVariables,
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
  const [sortSettings, setSortSettings] = useState<SortSettings<T>>({
    col: null,
    asc: true,
  });

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

  const defaultCompareFunc = useDefaultCompareFunc({ records, sortSettings });
  const recordsSorted = useSortedRows({
    records,
    sortSettings,
    defaultCompareFunc,
  });

  const SortIcon = sortSettings.asc ? FaSortUp : FaSortDown;

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between">
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
                <th
                  key={String(col.path)}
                  style={{
                    textWrap: "nowrap",
                    cursor: col.sortable ? "pointer" : "auto",
                  }}
                  onClick={() => {
                    const sortSettingsNew = { ...sortSettings };
                    if (col.sortable) {
                      if (col.path === sortSettings.col?.path) {
                        // already sorting on this column, so switch order
                        sortSettingsNew.asc = !sortSettings.asc;
                      } else {
                        // change sort column and leave order as-is
                        sortSettingsNew.col = col;
                      }
                      setSortSettings(sortSettingsNew);
                    }
                  }}
                >
                  <AlignedLabel>
                    {col.label}
                    {col.path === sortSettings.col?.path && col.sortable && (
                      <SortIcon className="ms-1 my-1 text-primary" />
                    )}
                  </AlignedLabel>
                </th>
              ))}
              {/* add an empty header for the row action */}
              {rowActionComponent && <th></th>}
            </tr>
          </thead>
          <tbody>
            {recordsSorted.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (rowActionComponent ? 1 : 0)}
                  className="text-center text-secondary"
                >
                  {noRowsMessage ? noRowsMessage : "No records found"}
                </td>
              </tr>
            ) : (
              recordsSorted.map((record, i) => (
                <RelatedRecordTableRow<T, P>
                  key={i}
                  columns={visibleColumns}
                  isValidating={isValidating}
                  onSaveCallback={onSaveCallback}
                  record={record}
                  mutation={mutation}
                  getMutationVariables={getMutationVariables}
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

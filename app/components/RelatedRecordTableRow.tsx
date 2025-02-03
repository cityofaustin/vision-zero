import { useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import DataCardInput from "./DataCardInput";
import { useMutation, useQuery, useLookupQuery } from "@/utils/graphql";
import {
  getRecordValue,
  renderColumnValue,
  valueToString,
  handleFormValueOutput,
} from "@/utils/formHelpers";
import { ColDataCardDef } from "@/types/types";
import { LookupTableOption } from "@/types/relationships";
import { RowActionButtonProps } from "@/components/RelatedRecordTable";

interface RelatedRecordTableRowProps<T extends Record<string, unknown>> {
  /**
   * The records to be rendered in the table
   */
  record: T;
  /**
   * The table's column definitions
   */
  columns: ColDataCardDef<T>[];
  /**
   * Graphql mutation that will be exectuted when a row is edited -
   * will also be passed to the rowActionButton, if present
   */
  mutation: string;
  /**
   * If the SWR refetcher is (re)validating
   */
  isValidating: boolean;
  /**
   * Callback function to be executed after a row edit is saved
   */
  onSaveCallback: () => Promise<void>;
  /**
   * Optional react component to be rendered in the rightmost column
   * of every row
   */
  rowActionButton?: React.ComponentType<RowActionButtonProps<T>>;
}

/**
 * Generic component which renders editable fields in a table row
 *
 * // todo: there is much shared code between this component and
 * the DataCard component. Essentially the only diff between the
 * two is row vs column layout 🤔
 */
export default function RelatedRecordTableRow<
  T extends Record<string, unknown>,
>({
  record,
  columns,
  mutation,
  isValidating,
  onSaveCallback,
  rowActionButton: RowActionButton,
}: RelatedRecordTableRowProps<T>) {
  // todo: loading state, error state
  // todo: handling of null/undefined values in select input
  const [editColumn, setEditColumn] = useState<ColDataCardDef<T> | null>(null);
  const { mutate, loading: isMutating } = useMutation(mutation);
  const [query, typename] = useLookupQuery(
    editColumn?.editable && editColumn?.relationship
      ? editColumn.relationship
      : undefined
  );
  const { data: selectOptions, isLoading: isLoadingLookups } =
    useQuery<LookupTableOption>({
      query,
      // we don't need to refetch lookup table options
      options: { revalidateIfStale: false },
      typename,
    });

  const onSave = async (recordId: number, value: unknown) => {
    if (!editColumn) {
      // not possible
      return;
    }
    // Save the value to the foreign key column, if exists
    const saveColumnName = editColumn.relationship?.foreignKey
      ? editColumn.relationship?.foreignKey
      : editColumn.path;

    const variables = {
      id: recordId,
      updates: {
        [saveColumnName]: value,
      },
    };

    await mutate(variables);
    await onSaveCallback();
    setEditColumn(null);
  };

  const onCancel = () => setEditColumn(null);

  return (
    <>
      <tr>
        {columns.map((col) => {
          const isEditingThisColumn = col.path === editColumn?.path;
          const isEditable = col.editable;

          return (
            <td
              key={String(col.path)}
              style={{
                cursor: isEditable && !isEditingThisColumn ? "pointer" : "auto",
                ...(col.style || {}),
              }}
              onClick={() => {
                if (!isEditable) {
                  return;
                }
                if (!isEditingThisColumn) {
                  setEditColumn(col);
                }
              }}
            >
              {!isEditingThisColumn && renderColumnValue(record, col)}
              {isEditingThisColumn &&
                col.customEditComponent &&
                col.customEditComponent(
                  record,
                  onCancel,
                  mutation,
                  onSaveCallback
                )}
              {isEditingThisColumn && !col?.customEditComponent && (
                <>
                  {isLoadingLookups && <Spinner size="sm" />}
                  {!isLoadingLookups && (
                    <DataCardInput
                      initialValue={valueToString(
                        getRecordValue(record, col, true),
                        col
                      )}
                      onSave={(value: string) =>
                        onSave(
                          Number(record.id),
                          handleFormValueOutput(
                            value,
                            !!col.relationship,
                            col.inputType
                          )
                        )
                      }
                      onCancel={onCancel}
                      inputType={col.inputType}
                      selectOptions={selectOptions}
                      isMutating={isMutating || isValidating}
                    />
                  )}
                </>
              )}
            </td>
          );
        })}
        {RowActionButton && (
          <td>
            <RowActionButton
              record={record}
              mutation={mutation}
              onSaveCallback={onSaveCallback}
            />
          </td>
        )}
      </tr>
    </>
  );
}

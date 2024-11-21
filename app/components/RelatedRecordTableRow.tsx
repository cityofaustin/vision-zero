import { useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import CrashDataCardInput from "./DataCardInput";
import { useMutation, useQuery, useLookupQuery } from "@/utils/graphql";
import {
  getRecordValue,
  renderColumnValue,
  valueToString,
  handleFormValueOutput,
} from "@/utils/formHelpers";
import { ColDataCardDef } from "@/types/types";
import { lookupOptionSchema } from "@/schema/lookupTable";

interface RelatedRecordTableRowProps<T extends Record<string, unknown>> {
  record: T;
  columns: ColDataCardDef<T>[];
  mutation: string;
  isValidating: boolean;
  onSaveCallback: () => Promise<void>;
}

/**
 * Generic component which renders editable fields in a table row
 *
 * // todo: there is much shared code between this component and
 * the DataCard component. Essenetially the only diff between the
 * two is row vs column layout 🤔
 */
export default function RelatedRecordTableRow<
  T extends Record<string, unknown>
>({
  record,
  columns,
  mutation,
  isValidating,
  onSaveCallback,
}: RelatedRecordTableRowProps<T>) {
  // todo: loading state, error state
  // todo: handling of null/undefined values in select input
  const [editColumn, setEditColumn] = useState<ColDataCardDef<T> | null>(null);
  const { mutate, loading: isMutating } = useMutation(mutation);
  const [query, typename] = useLookupQuery(editColumn?.lookupTable);
  const { data: selectOptions, isLoading: isLoadingLookups } = useQuery({
    query,
    // we don't need to refetch lookup table options
    options: { revalidateIfStale: false },
    schema: lookupOptionSchema,
    typename,
  });

  const onSave = async (recordId: number, value: unknown) => {
    await mutate({
      id: recordId,
      updates: {
        [String(editColumn?.name)]: value,
      },
    });
    await onSaveCallback();
    setEditColumn(null);
  };

  const onCancel = () => setEditColumn(null);

  return (
    <tr>
      {columns.map((col) => {
        const isEditingThisColumn = col.name === editColumn?.name;
        return (
          <td
            key={String(col.name)}
            style={{
              cursor: col.editable && !isEditingThisColumn ? "pointer" : "auto",
            }}
            onClick={() => {
              if (!col.editable) {
                return;
              }
              if (!isEditingThisColumn) {
                setEditColumn(col);
              }
            }}
          >
            {!isEditingThisColumn && renderColumnValue(record, col)}
            {isEditingThisColumn && (
              <>
                {isLoadingLookups && <Spinner size="sm" />}
                {!isLoadingLookups && (
                  <CrashDataCardInput
                    initialValue={valueToString(
                      getRecordValue(record, col),
                      col
                    )}
                    onSave={(value: string) =>
                      onSave(
                        Number(record.id),
                        handleFormValueOutput(
                          value,
                          !!col.lookupTable,
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
    </tr>
  );
}

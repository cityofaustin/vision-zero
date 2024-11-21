import { useState } from "react";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import DataCardInput from "./DataCardInput";
import { useMutation, useQuery, useLookupQuery } from "@/utils/graphql";
import {
  getRecordValue,
  renderColumnValue,
  valueToString,
  handleFormValueOutput,
} from "@/utils/formHelpers";
import { ColDataCardDef } from "@/types/types";
import { lookupOptionSchema } from "@/schema/lookupTable";

interface DataCardProps<T extends Record<string, unknown>> {
  record: T;
  columns: ColDataCardDef<T>[];
  mutation: string;
  isValidating: boolean;
  title: string;
  onSaveCallback: () => Promise<void>;
}

/**
 * Generic component which renders editable fields in a Card
 */
export default function DataCard<T extends Record<string, unknown>>({
  record,
  columns,
  mutation,
  isValidating,
  title,
  onSaveCallback,
}: DataCardProps<T>) {
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

  const onSave = async (value: unknown) => {
    await mutate({
      id: record.id,
      updates: {
        [String(editColumn?.name)]: value,
      },
    });
    await onSaveCallback();
    setEditColumn(null);
  };

  const onCancel = () => setEditColumn(null);

  return (
    <Card>
      <Card.Header>{title}</Card.Header>
      <Card.Body>
        <Table responsive hover>
          <tbody>
            {columns.map((col) => {
              const isEditingThisColumn = col.name === editColumn?.name;
              return (
                <tr
                  key={String(col.name)}
                  style={{
                    cursor:
                      col.editable && !isEditingThisColumn ? "pointer" : "auto",
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
                  <td style={{ textWrap: "nowrap" }} className="fw-bold">
                    {col.label}
                  </td>
                  {!isEditingThisColumn && (
                    <td>{renderColumnValue(record, col)}</td>
                  )}
                  {isEditingThisColumn && (
                    <td>
                      {isLoadingLookups && <Spinner size="sm" />}
                      {!isLoadingLookups && (
                        <DataCardInput
                          initialValue={valueToString(
                            getRecordValue(record, col),
                            col
                          )}
                          onSave={(value: string) =>
                            onSave(
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
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

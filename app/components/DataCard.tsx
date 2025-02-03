import { useState } from "react";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import DataCardInput from "@/components/DataCardInput";
import { useMutation, useQuery, useLookupQuery } from "@/utils/graphql";
import {
  getRecordValue,
  renderColumnValue,
  valueToString,
  handleFormValueOutput,
} from "@/utils/formHelpers";
import { ColDataCardDef } from "@/types/types";
import { LookupTableOption } from "@/types/relationships";
import { useAuth0 } from "@auth0/auth0-react";
import { hasRole } from "@/utils/auth";

export interface HeaderActionButtonProps<T extends Record<string, unknown>> {
  record: T;
  mutation: string;
  onSaveCallback: () => Promise<void>;
}

interface DataCardProps<T extends Record<string, unknown>> {
  record: T;
  columns: ColDataCardDef<T>[];
  mutation: string;
  isValidating: boolean;
  title: string;
  onSaveCallback: () => Promise<void>;
  HeaderActionButton?: React.ComponentType<HeaderActionButtonProps<T>>;
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
  HeaderActionButton,
}: DataCardProps<T>) {
  // todo: loading state, error state
  // todo: handling of null/undefined values in select input
  const [editColumn, setEditColumn] = useState<ColDataCardDef<T> | null>(null);
  const { mutate, loading: isMutating } = useMutation(mutation);
  const [query, typename] = useLookupQuery(
    editColumn?.editable && editColumn?.relationship
      ? editColumn.relationship
      : undefined
  );

  const { user } = useAuth0();

  const isReadOnlyUser = user && hasRole(["readonly"], user);

  const { data: selectOptions, isLoading: isLoadingLookups } =
    useQuery<LookupTableOption>({
      query,
      // we don't need to refetch lookup table options
      options: { revalidateIfStale: false },
      typename,
    });

  const onSave = async (value: unknown) => {
    if (!editColumn) {
      // not possible
      return;
    }
    // Save the value to the foreign key column, if exists
    const saveColumnName = editColumn.relationship?.foreignKey
      ? editColumn.relationship?.foreignKey
      : editColumn.path;
    await mutate({
      id: record.id,
      updates: {
        [saveColumnName]: value,
      },
    });
    await onSaveCallback();
    setEditColumn(null);
  };

  const onCancel = () => setEditColumn(null);

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between bg-white border-none">
        <Card.Title>{title}</Card.Title>
        {HeaderActionButton && !isReadOnlyUser && (
          <HeaderActionButton
            record={record}
            mutation={mutation}
            onSaveCallback={onSaveCallback}
          />
        )}
      </Card.Header>
      <Card.Body>
        <Table responsive hover>
          <tbody>
            {columns.map((col) => {
              const isEditingThisColumn = col.path === editColumn?.path;
              return (
                <tr
                  key={String(col.path)}
                  style={{
                    cursor:
                      col.editable && !isEditingThisColumn && !isReadOnlyUser
                        ? "pointer"
                        : "auto",
                  }}
                  onClick={() => {
                    if (!col.editable || isReadOnlyUser) {
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
                            getRecordValue(record, col, true),
                            col
                          )}
                          onSave={(value: string) =>
                            onSave(
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

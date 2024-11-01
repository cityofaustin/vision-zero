import { useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import CrashDataCardInput from "./CrashDataCardInput";
import { useMutation, useQuery } from "@/utils/graphql";
import { gql } from "graphql-request";
import { UPDATE_CRASH } from "@/queries/crash";
import {
  getRecordValue,
  renderColumnValue,
  stringToBoolNullable,
  trimStringNullable,
  stringToNumberNullable,
  valueToString,
} from "@/utils/formHelpers";
import { KeyedMutator } from "swr";
import {
  InputType,
  ColDataCardDef,
  LookupTableDef,
  LookupTableOption,
} from "@/types/types";

/**
 * Function which transforms form input string into the value
 * that will be sent in the the db mutation
 *
 * todo: wrap this in a try/catch and use validation erro
 */
const handleValue = (
  value: string,
  isLookup: boolean,
  inputType?: InputType
): unknown | null | boolean => {
  if (inputType === "yes_no") {
    return stringToBoolNullable(value);
  }
  if (inputType === "number" || (inputType === "select" && isLookup)) {
    return stringToNumberNullable(value);
  }
  // handle everything else as a nulllable string
  return trimStringNullable(value);
};

const useLookupQuery = (lookupTableDef: LookupTableDef | undefined) =>
  useMemo(() => {
    if (!lookupTableDef) {
      return [];
    }
    // construct the Hasura typename, which is prefixed with the schema name
    // if schema is not public
    const prefix =
      lookupTableDef.tableSchema === "public"
        ? ""
        : lookupTableDef.tableSchema + "_";

    const typeName = `${prefix}${lookupTableDef.tableName}`;

    return [
      gql`
      query LookupTableQuery {
        ${typeName}(order_by: {id: asc}) {
          id
          label
        }
      }
    `,
      typeName,
    ];
  }, [lookupTableDef]);

interface DataCardProps<T extends Record<string, unknown>> {
  record: T;
  columns: ColDataCardDef<T>[];
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
  isValidating,
  title,
  onSaveCallback,
}: DataCardProps<T>) {
  // todo: loading state, error state
  // todo: handling of null/undefined values in select input
  const [editColumn, setEditColumn] = useState<ColDataCardDef<T> | null>(null);
  const { mutate, loading: isMutating } = useMutation(UPDATE_CRASH);
  const [query, typeName] = useLookupQuery(editColumn?.lookupTable);
  const { data: lookupData, isLoading: isLoadingLookups } = useQuery<{
    [key: string]: LookupTableOption[];
  }>({
    query,
    // we don't need to refetch lookup table options
    options: { revalidateIfStale: false },
  });

  const selectOptions = lookupData?.[typeName];

  const onSave = async (value: unknown) => {
    await mutate({
      id: record.id,
      updates: {
        [editColumn?.name as string]: value,
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
        <Table striped hover>
          <tbody>
            {columns.map((col) => {
              const isEditingThisColumn = col.name === editColumn?.name;
              return (
                <tr
                  key={String(col.name)}
                  style={{ cursor: col.editable ? "pointer" : "auto" }}
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
                        <CrashDataCardInput
                          initialValue={valueToString(
                            getRecordValue(record, col),
                            col
                          )}
                          onSave={(value: string) =>
                            onSave(
                              handleValue(
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

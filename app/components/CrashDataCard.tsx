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
  stringToBoolNullable,
  trimStringNullable,
  stringToNumberNullable,
  valueToString,
} from "@/utils/formHelpers";
import { KeyedMutator } from "swr";
import {
  Crash,
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

/**
 * Render a static column value (e.g., in a table cell)
 * 
 * Todo: this should be moved to a util
 */
const renderValue = <T extends {}>(record: T, column: ColDataCardDef<T>) => {
  if (column.valueRenderer) {
    return column.valueRenderer(record, column);
  }
  // todo: these should probably be valueFormatter's? 😵‍💫
  if (column.relationshipName) {
    const relatedObject = record[column.relationshipName] as LookupTableOption;
    return relatedObject?.label;
  }
  if (column.inputType === "yes_no") {
    const value = record[column.name];
    if (value === null) return "";
    return value ? "Yes" : "No";
  }
  if (column.valueFormatter) {
    return column.valueFormatter(
      getRecordValue(record, column),
      record,
      column
    );
  }
  return String(record[column.name] || "");
};

/**
 * Transforms the db value into the form input initial value
 */

export default function CrashDataCard({
  crash,
  columns,
  isValidating,
  title,
  refetch,
}: {
  crash: Crash;
  columns: ColDataCardDef<Crash>[];
  isValidating: boolean;
  title: string;
  refetch: KeyedMutator<{ crashes: Crash[] }>;
}) {
  // todo: loading state, error state
  // todo: handling of null/undefined values in select input
  const [editColumn, setEditColumn] = useState<ColDataCardDef<Crash> | null>(
    null
  );
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
      id: crash.id,
      updates: {
        [editColumn?.name as string]: value,
      },
    });
    await refetch();
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
                  key={col.name}
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
                  {!isEditingThisColumn && <td>{renderValue(crash, col)}</td>}
                  {isEditingThisColumn && (
                    <td>
                      {isLoadingLookups && <Spinner size="sm" />}
                      {!isLoadingLookups && (
                        <CrashDataCardInput
                          initialValue={valueToString(
                            getRecordValue(crash, col),
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

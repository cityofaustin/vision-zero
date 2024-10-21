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
  valueToString,
  stringToBoolNullable,
  trimStringNullable,
  stringToNumberNullable,
} from "@/utils/formatters";
import { KeyedMutator } from "swr";
import {
  Crash,
  InputType,
  TableColumn,
  LookupTableDef,
  LookupTableOption,
  HasuraLookupTableData,
} from "@/types/types";

/**
 * Function which transforms form input value into value that
 * will be sent in mutation payload
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
        ${typeName} {
          id
          label
        }
      }
    `,
      typeName,
    ];
  }, [lookupTableDef]);

/**
 * Render a static field value (e.g., in a table cell)
 * -- todo: this will be used by the table component as well
 */
const renderValue = (crash: Crash, col: TableColumn<Crash>) => {
  if (col.relationshipName) {
    const relatedObject = crash[col.relationshipName] as LookupTableOption;
    return relatedObject?.label;
  }
  if (col.inputType === "yes_no") {
    const value = crash[col.key];
    if (value === null) return "";
    return value ? "Yes" : "No";
  }
  return col.renderer ? col.renderer(crash) : String(crash[col.key] || "");
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
  columns: TableColumn<Crash>[];
  isValidating: boolean;
  title: string;
  refetch: KeyedMutator<{ crashes: Crash[] }>;
}) {
  // todo: loading state, error state
  // todo: handling of null/undefined values in select input
  const [editColumn, setEditColumn] = useState<TableColumn<Crash> | null>(null);
  const { mutate, loading: isMutating } = useMutation(UPDATE_CRASH);
  const [query, typeName] = useLookupQuery(editColumn?.lookupTable);
  const { data: lookupData, isLoading: isLoadingLookups } =
    useQuery<HasuraLookupTableData>({
      query,
      // we don't need to refetch lookup table options
      options: { revalidateIfStale: false },
    });

  const selectOptions = lookupData?.[typeName];

  const onSave = async (value: unknown) => {
    await mutate({
      id: crash.id,
      updates: {
        [editColumn?.key as string]: value,
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
              const isEditingThisColumn = col.key === editColumn?.key;
              return (
                <tr
                  key={col.key}
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

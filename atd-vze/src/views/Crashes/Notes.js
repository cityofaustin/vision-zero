import React, { Component } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Card, CardHeader, CardBody, CardFooter, Table } from "reactstrap";
import moment from "moment";
import { notesDataMap } from "./notesDataMap";
import { GET_NOTES } from "../../queries/notes";

// declare a notes component
const Notes = ({ ...props }) => {
  // pull crashid for page
  const crashId = props.match.params.id;

  // fetch data from database using graphQL query
  const { loading, error, data, refetch } = useQuery(GET_NOTES, {
    variables: { crashId },
  });

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const tableName = "notes";
  const keyField = "id";
  const fieldConfig = notesDataMap[0];

  // render notes card and table
  return (
    <Card>
      <CardHeader>Notes</CardHeader>
      <CardBody>
        <Table>
          <thead>
            <tr>
              {/* display label for each field in table header */}
              {Object.keys(fieldConfig.fields).map(field => (
                <th key={`th_${fieldConfig.fields[field].label}`}>
                  {fieldConfig.fields[field].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* iterate through each row in notes table */}
            {data.notes.map(row => {
              return (
                <tr key={`table-${tableName}-${row[keyField]}`}>
                  {/* iterate through each field in the row and render its value */}
                  {Object.keys(fieldConfig.fields).map((field, i) => {
                    return (
                      <td key={i}>
                        {/* format value if the field is a date */}
                        {field == "date"
                          ? moment(row[field]).format("MM/DD/YYYY")
                          : row[field]}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </CardBody>
      <CardFooter></CardFooter>
    </Card>
  );
};

export default Notes;

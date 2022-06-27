import React, { Component, useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Card, CardHeader, CardBody, CardFooter, Table, Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { withApollo } from "react-apollo";
import moment from "moment";

import DataTable from "../../Components/DataTable";
import { notesDataMap } from "./notesDataMap";
import { GET_NOTES } from "../../queries/notes";
import { GET_CRASH, UPDATE_CRASH } from "../../queries/crashes";
import RelatedRecordsTable from "./RelatedRecordsTable";

//FIXME page crashes if there are no notes for that crash id in table`

// declare a notes component
const Notes = ({...props }) => {
  const crashId = props.match.params.id;

  // fetch data using graphQL query from database
  const { loading, error, data, refetch } = useQuery(GET_NOTES, {
    variables: { crashId },
  });

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const tableName = "notes";
  const keyField = "id";
  const fieldConfig = notesDataMap[0];

  // function to format date field values
  function formatDate(field, row) {
    if (field == "date") {
      return moment(row[field]).format("YYYY-MM-DD");
    } else {
      return row[field];
    }

  }

  return (
    <Card>
      <CardHeader>Notes</CardHeader>
      <CardBody>
        <Table>
          <thead>
            <tr>
              {Object.keys(fieldConfig.fields).map(field => (
                <th key={`th_${fieldConfig.fields[field].label}`}>
                  {fieldConfig.fields[field].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.notes.map(row => {
              return (
                <tr key={`table-${tableName}-${row[keyField]}`}>
                  {Object.keys(fieldConfig.fields).map((field, i) => {
                    return (
                      <td key={i}>
                        {formatDate(field, row)}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </Table>
      </CardBody>
      <CardFooter>

      </CardFooter>
    </Card>
  );
}

export default Notes;

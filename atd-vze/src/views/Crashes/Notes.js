import React, { Component, useState } from "react";
import { useQuery } from "@apollo/react-hooks";
import { Card, CardHeader, CardBody, CardFooter, Table, Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { withApollo } from "react-apollo";

import DataTable from "../../Components/DataTable";
import { notesDataMap } from "./notesDataMap";
import { GET_NOTES } from "../../queries/notes";
import { GET_CRASH, UPDATE_CRASH } from "../../queries/crashes";
import RelatedRecordsTable from "./RelatedRecordsTable";

//create a notes component
// function Notes(...props) {
//   const crashId = props.match.params.id;
//   const { loading, error, data, refetch } = useQuery(GET_NOTES, {
//     variables: { crashId },
//   });'

const Notes = ({...props }) => {
  const crashId = props.match.params.id;

  const { loading, error, data, refetch } = useQuery(GET_NOTES, {
    variables: { crashId },
  });

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  return (
    <Card>
      <CardHeader>Notes</CardHeader>
      <CardBody>
      <RelatedRecordsTable
        fieldConfig={notesDataMap[0]}
        data={data.notes}
        sortField={"id"}
        tableName={"notes"}
        keyField={"unit_nbr"}
        // lookupOptions={lookupSelectOptions}
        // mutation={unitMutation}
        // refetch={refetch}
        {...props}
      />
      </CardBody>
      <CardFooter>

      </CardFooter>
    </Card>
  );
}

export default Notes;

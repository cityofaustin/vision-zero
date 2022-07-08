import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { Card, CardHeader, CardBody, CardFooter, Table, Input, Button } from "reactstrap";
import moment from "moment";
import { notesDataMap } from "./notesDataMap";
import { GET_NOTES, INSERT_NOTE } from "../../queries/notes";
import { useAuth0, isReadOnly } from "../../auth/authContext";

// declare a notes component
const Notes = ({ crashId }) => {

  // add a state variable to manage value when new note is entered
  const [newNote, setNewNote] = useState("");

  // disable edit features if role is "readonly"
  const { getRoles } = useAuth0();
  const roles = getRoles();

  // fetch data from database using graphQL query
  const { loading, error, data, refetch } = useQuery(GET_NOTES, {
    variables: { crashId },
  });

  // declare insert mutation function
  const [addNote] = useMutation(INSERT_NOTE);

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const tableName = "notes";
  const keyField = "id";
  const fieldConfig = notesDataMap[0];

  // function to handle add button click
  const handleAddNoteClick = () => {
    const userEmail = localStorage.getItem("hasura_user_email");
    addNote({
      variables: {
        note: newNote,
        crashId: crashId,
        userEmail: userEmail
      }
    }).then(response => {
      setNewNote("")
      .catch(error => console.error(error));
      refetch();
    });
  };

  // render notes card and table
  return (
    <Card>
      <CardHeader>{fieldConfig.title}</CardHeader>
      <CardBody>
        <Table>
          <tr>
            {/* display label for each field in table header */}
            {Object.keys(fieldConfig.fields).map(field => (
              <th key={`th_${fieldConfig.fields[field].label}`}>
                {fieldConfig.fields[field].label}
              </th>
            ))}
            <th>
            </th>
          </tr>
          <tbody>
            {/* display user input row for users with edit permissions*/}
            {!isReadOnly(roles) &&
              <tr>
                <td>
                </td>
                <td>
                </td>
                <td>
                  <Input
                    type="textarea"
                    placeholder="Enter new note here..."
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                  />
                </td>
                <td>
                  <Button
                    type="submit"
                    color="primary"
                    onClick={(e) => {
                      handleAddNoteClick();
                    }}
                  >
                    Add
                  </Button>
                </td>
              </tr>}
            {/* iterate through each row in notes table */}
            {data.notes.map(row => {
              return (
                <tr key={`table-${tableName}-${row[keyField]}`}>
                  {/* iterate through each field in the row and render its value */}
                  {Object.keys(fieldConfig.fields).map((field, i) => {
                    return (
                      <td key={i}>
                        {/* format value if the field is a date */}
                        {field === "date"
                          ? moment(row[field]).format("MM/DD/YYYY")
                          : row[field]}
                      </td>
                    );
                  })}
                  <td>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </CardBody>
      <CardFooter>
      </CardFooter>
    </Card>
  );
};

export default Notes;

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { Card, CardHeader, CardBody, CardFooter, Table, Input, Button } from "reactstrap";
import moment from "moment";
import { notesDataMap } from "./notesDataMap";
import { GET_NOTES, INSERT_NOTE, UPDATE_NOTE, DELETE_NOTE } from "../../queries/notes";
import { useAuth0, isReadOnly } from "../../auth/authContext";

// declare a notes component
const Notes = ({ crashId }) => {

  // add a state variable to manage value when new note is entered
  const [newNote, setNewNote] = useState("");
  const [editedNote, setEditedNote] = useState("");
  const [editRow, setEditRow] = useState("");

  // disable edit features if role is "readonly"
  const { getRoles } = useAuth0();
  const roles = getRoles();

  // fetch data from database using graphQL query
  const { loading, error, data, refetch } = useQuery(GET_NOTES, {
    variables: { crashId },
  });

  // declare mutation functions
  const [addNote] = useMutation(INSERT_NOTE);
  const [editNote] = useMutation(UPDATE_NOTE);
  const [deleteNote] = useMutation(DELETE_NOTE);

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
      setNewNote("");
      refetch();
    }).catch(error => console.error(error));
  };

  // function to handle edit button click
  const handleEditClick = (row) => {
    setEditRow(row);
  };

  // function to handle save edit button click
  const handleCheckClick = (row) => {
    const id = row.id
    editNote({
      variables: {
        note: editedNote,
        id: id
      }
    }).then(response => {
      setEditedNote("");
      refetch();
    }).catch(error => console.error(error));
  };

  // function to handle cancel button click
  const handleCancelClick = () => {
    setEditRow("");
    setEditedNote("");
  }

  //function to handle delete note button click
  const handleDeleteClick = (row) => {
    const id = row.id
    deleteNote({
      variables: {
        id: id
      }
    }).then(response => {
      refetch();
    }).catch(error => console.error(error));
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
                    onClick={handleAddNoteClick}
                    className="btn-pill mt-2"
                  >
                    Add
                  </Button>
                </td>
                <td>
                </td>
              </tr>}
            {/* iterate through each row in notes table */}
            {data.notes.map(row => {
              const isEditing = editRow === row;
              return (
                <tr key={`table-${tableName}-${row[keyField]}`}>
                  {/* iterate through each field in the row and render its value */}
                  {Object.keys(fieldConfig.fields).map((field, i) => {
                    return (
                      <td key={i}>
                        {/* if user is editing display editing input text box */}
                        {isEditing && field === "text"
                          ? <Input
                          type="textarea"
                          defaultValue={row[field]}
                          onChange={e => setEditedNote(e.target.value)}
                          />
                          : field === "date"
                            ? moment(row[field]).format("MM/DD/YYYY")
                            : row[field]
                        }
                      </td>
                    );
                  })}
                  {/* display edit button if user has edit permissions */}
                  {!isReadOnly(roles) && !isEditing &&
                    <td>
                        <Button
                          type="submit"
                          color="secondary"
                          size="sm"
                          className="btn-pill mt-2"
                          style={{ width: "50px" }}
                          onClick={e => handleEditClick(row)}
                        >
                          <i className="fa fa-pencil edit-toggle" />
                        </Button>
                    </td>}
                  {/* display delete button if user has edit permissions */}
                  {!isReadOnly(roles) && !isEditing &&
                    <td>
                      <Button
                      type="submit"
                      color="secondary"
                      className="btn-pill mt-2"
                      size="sm"
                      style={{ width: "50px" }}
                      onClick={e => handleDeleteClick(row)}
                      >
                        <i className="fa fa-trash" />
                      </Button>
                    </td>}
                  {/* display accept button if user is editing */}
                  {!isReadOnly(roles) && isEditing &&
                    <td>
                      <Button
                      color="primary"
                      className="btn-pill mt-2"
                      size="sm"
                      style={{ width: "50px" }}
                      onClick={e => handleCheckClick(row)}
                      >
                        <i className="fa fa-check edit-toggle" />
                      </Button>
                    </td>
                  }
                  {/* display cancel button if user is editing */}
                  {!isReadOnly(roles) && isEditing &&
                    <td>
                      <Button
                      type="submit"
                      color="danger"
                      className="btn-pill mt-2"
                      size="sm"
                      style={{ width: "50px" }}
                      onClick={e => handleCancelClick(e)}
                      >
                        <i className="fa fa-times edit-toggle" />
                      </Button>
                    </td>
                  }
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

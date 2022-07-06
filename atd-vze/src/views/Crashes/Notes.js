import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { Card, CardHeader, CardBody, CardFooter, Table, Input, Button } from "reactstrap";
import moment from "moment";
import { notesDataMap } from "./notesDataMap";
import { GET_NOTES, INSERT_NOTE } from "../../queries/notes";
import { useAuth0, isReadOnly } from "../../auth/authContext";

import DatePicker from "react-datepicker";
// import required css from library
import 'react-datepicker/dist/react-datepicker-cssmodules.css';
import styled from "styled-components";
import { colors } from "../../styles/colors";
import Handsontable from "handsontable";

// declare a notes component
const Notes = ({ crashId }) => {

  // add a state variable to manage value when new note in entered
  const [newNote, setNewNote] = useState("");
  // add a state variable to manage the value when date is selected
  const [date, setDate] = useState(new Date());
  const [notesData, setNotesData] = useState([]);

  // disable edit features if only role is "readonly"
  const { getRoles } = useAuth0();
  const roles = getRoles();

  // fetch data from database using graphQL query
  const { loading, error, data, refetch } = useQuery(GET_NOTES, {
    variables: { crashId },
  });

  const [addNote] = useMutation(INSERT_NOTE);

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const tableName = "notes";
  const keyField = "id";
  const fieldConfig = notesDataMap[0];

  const StyledDatePicker = styled.div`
  /* Add Bootstrap styles to picker inputs */
  .react-datepicker__input-container > input {
    height: calc(1.5em + 0.75rem + 2px);
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
    color: ${colors.grey700};
    background-color: ${colors.white};
    background-clip: padding-box;
    border: 1px solid ${colors.grey200};
    border-radius: 0.25rem;
  }
`;

  // function to handle add button
  const handleAddNoteClick = () => {
    const userEmail = localStorage.getItem("hasura_user_email"); //FIXME: is this the best place to declare this variable?
    addNote({
      variables: {
        note: newNote,
        crashId: crashId,
        date: date,
        userEmail: userEmail
      }
    });
    refetch();
  };

  // render notes card and table
  return (
    <Card>
      <CardHeader>{fieldConfig.title}</CardHeader>
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
            {/* display user input row if user is not read only */}
            {!isReadOnly(roles) &&
              <tr>
                <td>
                  {/* render date input with calendar drop down */}
                  <StyledDatePicker>
                    <DatePicker selected={date} onChange={(date) =>
                      setDate(date)} />
                  </StyledDatePicker>
                </td>
                <td>
                </td>
                {/* render text box for user to add note */}
                <td>
                  <Input
                    type="textarea"
                    placeholder="Enter new note here..."
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

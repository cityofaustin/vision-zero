import React, { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Table, Input, Button } from "reactstrap";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { locationNotesDataMap } from "./locationNotesDataMap";
import moment from "moment";
import { GET_LOCATION_NOTES } from "../../queries/locationNotes";
import { useAuth0, isReadOnly } from "../../auth/authContext";

const LocationNotes = ({ locationId }) => {

	// disable edit features if role is "readonly"
	const { getRoles } = useAuth0();
	const roles = getRoles();

	// get current users email
	const userEmail = localStorage.getItem("hasura_user_email");

	// fetch data from database using graphQL query
	const { loading, error, data, refetch } = useQuery(GET_LOCATION_NOTES, {
		variables: { locationId },
	});

	console.log(data);

	if (loading) return "Loading...";
	if (error) return `Error! ${error.message}`;

	const tableName = "location_notes";
	const keyField = "id";
	const fieldConfig = locationNotesDataMap[0];

	return (
		<Card>
			<CardHeader>{fieldConfig.title}</CardHeader>
			<CardBody style={{ padding: "5px 20px 20px 20px" }}>
				<Table style={{ width: "100%" }}>
					<thead>
						{/* display label for each field in table header*/}
						<tr style={{ "border-top": "0px" }}>
							<th style={{ width: "10%", "border-top": "0px" }}>
								{fieldConfig.fields.date.label}
							</th>
							<th style={{ width: "24%", "border-top": "0px" }}>
								{fieldConfig.fields.user_email.label}
							</th>
							<th style={{ width: "54%", "border-top": "0px" }}>
								{fieldConfig.fields.text.label}
							</th>
						</tr>
					</thead>
					<tbody>
						{/* iterate through each row in notes table */}
						{data.location_notes.map(row => {
							return(
								<tr key={`table-${tableName}-${row[keyField]}`}>
									{/* iterate through each field in the row and render its value */}
                  {Object.keys(fieldConfig.fields).map((field, i) => {
                    return (
                      <td key={i}>
                        {field === "date"
                            ? moment(row[field]).format("MM/DD/YYYY")
                            : row[field]
                        }
                      </td>
                    );
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

};

export default LocationNotes;

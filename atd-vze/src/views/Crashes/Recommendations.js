import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { Card, CardHeader, CardBody, CardFooter, Table, Button } from "reactstrap";
import { recommendationsDataMap } from "./recommendationsDataMap";
import { GET_RECOMMENDATIONS } from "../../queries/recommendations";
import { useAuth0, isReadOnly } from "../../auth/authContext";

// declare fatality review board recommendations component
const Recommendations = ({ crashId }) => {

	// add state variable to manage when user is editing
	const [editMode, setEditMode] = useState(false);

	// disable edit features if role is "readonly"
	const { getRoles } = useAuth0();
	const roles = getRoles();

	// fetch data from database using graphQL query
	const { loading, error, data, refetch } = useQuery(GET_RECOMMENDATIONS, {
		variables: { crashId },
	});

	if (loading) return "Loading...";
	if (error) return `Error! ${error.message}`;

	const fieldConfig = recommendationsDataMap;
	const recommendation = data?.recommendations?.[0];

	// if crash has data in recommendations table, display it
	const displayData = (data, { lookupOptions, key }) => {
		if (recommendation) {
			if (lookupOptions) {
				return data[lookupOptions][key];
			} else {
				return data[key];
			}
		}
	};

	const handleEditClick = () => {
		setEditMode(true);
	};

	return (
		<Card>
			<CardHeader>Fatality Review Board Recommendations</CardHeader>
			<CardBody style={{ padding: "5px 20px 20px 20px" }}>
				<Table>
					<tr style={{ width: "100%", "border-top": "0px" }}>
						<td style={{ width: "35%", "border-top": "0px" }}>
							<b>Coordination Partner: </b>
							{displayData(recommendation, fieldConfig.fields.coordination_partner_id)}
						</td>
						<td style={{ width: "65%", "border-top": "0px" }}>
							<b>Status: </b>
							{displayData(recommendation, fieldConfig.fields.recommendation_status_id)}
						</td>
					</tr>
					<tr>
						<td colspan={2}>
							{displayData(recommendation, fieldConfig.fields.text)}
						</td>
						{!isReadOnly(roles) && !isEditing &&
							<td>
								<Button
									type="submit"
									color="secondary"
									size="sm"
									className="btn-pill mt-2"
									style={{ width: "50px" }}
									onClick={handleEditClick}
								>
									<i className="fa fa-pencil edit-toggle" />
								</Button>
							</td>
						}
					</tr>
				</Table>
			</CardBody>
			<CardFooter>
			</CardFooter>
		</Card>
	)
};

export default Recommendations;

import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { Card, CardHeader, CardBody, CardFooter, Table, Button } from "reactstrap";
import { recommendationsDataMap } from "./recommendationsDataMap";
import { GET_RECOMMENDATIONS } from "../../queries/recommendations";
import { useAuth0, isReadOnly } from "../../auth/authContext";

const Recommendations = ({ crashId }) => {

  // fetch data from database using graphQL query
  const { loading, error, data, refetch } = useQuery(GET_RECOMMENDATIONS, {
    variables: { crashId },
  });

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  // may not need to use some of these variables
  const tableName = "recommendations";
  const keyField = "id";
  const fieldConfig = recommendationsDataMap[0];

    return(
        <Card>
            <CardHeader>{fieldConfig.title}</CardHeader>
            <CardBody>
                <Table>
                    <tr style={{width: "100%"}}>
                        <td style={{width: "25%"}}>
                            <b>{fieldConfig.fields.coordination_partner_id.label}</b>
                            {data.recommendations[0].atd__coordination_partners_lkp.description}
                        </td>
                        <td style={{width: "75%"}}>
                            <b>{fieldConfig.fields.recommendation_status_id.label}</b>
                            {data.recommendations[0].atd__recommendation_status_lkp.description}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            {data.recommendations[0].text}
                        </td>
                        <td>
                        </td>
                    </tr>
                </Table>
            </CardBody>
            <CardFooter>
            </CardFooter>
        </Card>
    )
};

export default Recommendations;

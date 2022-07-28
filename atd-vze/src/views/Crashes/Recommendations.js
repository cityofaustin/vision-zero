import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { Card, CardHeader, CardBody, CardFooter, Table, Button } from "reactstrap";
import { recommendationsDataMap } from "./recommendationsDataMap";
import { GET_RECOMMENDATIONS } from "../../queries/recommendations";
import { useAuth0, isReadOnly } from "../../auth/authContext";

// declare fatality review board recommendations component
const Recommendations = ({ crashId }) => {

  // fetch data from database using graphQL query
  const { loading, error, data, refetch } = useQuery(GET_RECOMMENDATIONS, {
    variables: { crashId },
  });

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const fieldConfig = recommendationsDataMap[0];

    return(
        <Card>
            <CardHeader>{fieldConfig.title}</CardHeader>
            <CardBody>
                <Table>
                    <tr style={{width: "100%"}}>
                        <td style={{width: "35%"}}>
                            <b>{fieldConfig.fields.coordination_partner_id.label}</b>
                            {/* i feel like this part of my code where i check if there is a record for the current
                            crash is repetive, would welcome more efficient methods so i dont have to write the
                            same conditional three times */}
                            {data.recommendations[0] &&
                                data.recommendations[0].atd__coordination_partners_lkp.description
                            }
                        </td>
                        <td style={{width: "65%"}}>
                            <b>{fieldConfig.fields.recommendation_status_id.label}</b>
                            {data.recommendations[0] &&
                                data.recommendations[0].atd__recommendation_status_lkp.description
                            }
                        </td>
                    </tr>
                    <tr>
                        <td colspan={2}>
                            {data.recommendations[0] &&
                                data.recommendations[0].text
                            }
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

import React from "react";
import {
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
} from "reactstrap";
import { Link } from "react-router-dom";

import { useQuery } from "@apollo/react-hooks";
import { withApollo } from "react-apollo";

import { GET_CRASHES_QA } from "../../queries/CrashesQA";

const columns = [
  "Location ID",
  "Description"
];
function LocationsData(props) {
  return (
      <Table responsive>
                <thead>
                  <tr>
                    {columns.map((col, i) => (
                      <th key={`th-${i}`}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {props.data.atd_txdot_locations.map(location => (
                    <tr key={location.unique_id}>
                      <td>
                        <Link to={`/locations/${location.unique_id}`}>
                          {location.unique_id}
                        </Link>
                      </td>
                      <td>{location.description}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
  );
}

export default LocationsData;

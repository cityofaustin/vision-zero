import React, { useState } from "react";

import LocationsData from "./LocationsData";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
} from "reactstrap";

import { useQuery } from "@apollo/react-hooks";
import { withApollo } from "react-apollo";

import { GET_LOCATIONS } from "../../queries/Locations";

function Locations(props) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const offset = page * limit - limit;

  const { loading, error, data } = useQuery(GET_LOCATIONS, {
    variables: {
      recordLimit: limit,
      recordOffset: offset,
    },
  });

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const totalRecords = data.atd_txdot_locations_aggregate.aggregate.count;
  const totalPages = Math.ceil(totalRecords / limit);

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  let pagesList = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === page) {
      pagesList.push(
        <option selected="selected" key={i} value={i}>
          {i}
        </option>
      );
    } else {
      pagesList.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }
  }

  const handleFieldSelect = e => {
    setPage(e.target.value);
  };

  return (
    <div className="animated fadeIn">
      <Row>
        <Col>
          <Card>
            <CardHeader>
              <i className="fa fa-car" /> Locations
              <span className={"float-right"}>
                <Badge style={{ marginLeft: "20px" }} color={"default"}>
                  Total Records: {totalRecords}
                </Badge>
              </span>
              <select
                className={"float-right"}
                value={page}
                onChange={handleFieldSelect}
              >
                {pagesList}
              </select>
              <span className={"float-right"}>
                <Badge style={{ marginLeft: "20px" }} color={"default"}>
                  Current Page
                </Badge>
              </span>
              <Button
                disabled={page < totalPages ? false : true}
                onClick={() => setPage(page + 1)}
                style={{ marginLeft: "20px" }}
                className={"float-right"}
                color={"primary"}
                size={"sm"}
              >
                Next Page
              </Button>
              <Button
                disabled={page > 1 ? false : true}
                onClick={() => setPage(page - 1)}
                className={"float-right"}
                color={"primary"}
                size={"sm"}
              >
                Previous Page
              </Button>
            </CardHeader>
            <CardBody>
              <LocationsData offset={offset} data={data} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default withApollo(Locations);

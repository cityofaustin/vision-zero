import React, { useState } from "react";
import LocationEditMap from "./LocationEditMap";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Button,
  ButtonGroup,
} from "reactstrap";
import { withApollo } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";

import locationDataMap from "./locationDataMap";

import { GET_LOCATION } from "../../queries/Locations";

function Location(props) {
  const locationId = props.match.params.id;
  const [mapSelected, setMapSelected] = useState("aerial");
  const { loading, error, data } = useQuery(GET_LOCATION, {
    variables: { id: locationId },
  });

  const handleMapChange = e => {
    e.preventDefault();
    setMapSelected(e.target.id);
  };

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  return (
    <div className="animated fadeIn">
      <Row>
        <Col lg={6}>
          {locationDataMap.map(section => {
            return (
              <Card key={section.title}>
                <CardHeader>{section.title}</CardHeader>
                <CardBody>
                  <Table responsive striped hover>
                    <tbody>
                      {Object.keys(section.fields).map((field, i) => {
                        return (
                          <tr key={i}>
                            <td>{`${section.fields[field]}:`}</td>
                            <td>
                              <strong>
                                {data.atd_txdot_locations[0][field]}
                              </strong>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            );
          })}
        </Col>

        <Col lg={6}>{/*ADD A FEATURE SOON!*/}</Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <CardHeader>
              View or Edit Location
              <ButtonGroup className="float-right">
                <Button
                  active={mapSelected === "aerial"}
                  id="aerial"
                  onClick={handleMapChange}
                  color="light"
                >
                  Aerial Map
                </Button>
                <Button
                  active={mapSelected === "edit"}
                  id="edit"
                  onClick={handleMapChange}
                  color="light"
                >
                  Edit Polygon
                </Button>
              </ButtonGroup>
            </CardHeader>
            <CardBody>
              {data && mapSelected === "edit" && (
                <LocationEditMap data={data} />
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default withApollo(Location);

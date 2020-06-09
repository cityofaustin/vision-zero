import React, { useState, useEffect } from "react";
import moment from "moment";
import DataTable from "../../Components/DataTable";
import LocationMap from "./LocationMap";
import LocationEditMap from "./LocationEditMap";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";

import { withApollo } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";

import locationDataMap from "./locationDataMap";
import LocationCrashes from "./LocationCrashes";
import LocationNonCR3Crashes from "./LocationNonCR3Crashes";

import { GET_LOCATION, UPDATE_LOCATION } from "../../queries/Locations";

function Location(props) {
  const [mapSelected] = useState("aerial");

  // Set initial variables for GET_LOCATION query
  const locationId = props.match.params.id;

  const fiveYearsAgo = moment()
    .subtract(5, "years")
    .format("YYYY-MM-DD");

  const [variables, setVariables] = useState({
    id: locationId,
    yearsAgoDate: fiveYearsAgo,
    costPerCrash: parseFloat(0),
  });

  const { loading, error, data, refetch } = useQuery(GET_LOCATION, {
    variables,
  });

  // Retrieve est_comp_cost_amount of Non-CR3 crashes from DB and set updated variable
  useEffect(() => {
    if (
      Object.entries(data).length !== 0 &&
      data.locationTotals[0].noncr3_est_comp_cost === 0
    ) {
      const costPerNonCr3Crash = data.nonCr3EstCompCost[0].est_comp_cost_amount;
      setVariables({ ...variables, costPerCrash: costPerNonCr3Crash });
    }
  }, [data, variables]);

  // On variable change, refetch to get calculated Non-CR3 total_est_comp_cost
  useEffect(() => {
    refetch(variables);
  }, [variables, refetch]);

  const [editField, setEditField] = useState("");
  const [formData, setFormData] = useState({});

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const handleInputChange = e => {
    const newFormState = Object.assign(formData, {
      [editField]: e.target.value,
    });
    setFormData(newFormState);
  };

  const handleFieldUpdate = e => {
    e.preventDefault();

    props.client
      .mutate({
        mutation: UPDATE_LOCATION,
        variables: {
          locationId: locationId,
          changes: formData,
        },
      })
      .then(res => refetch());

    setEditField("");
  };

  return (
    <div className="animated fadeIn">
      <Row>
        <Col>
          <h2 className="h2 mb-3">{data.atd_txdot_locations[0].description}</h2>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Card>
            <CardHeader>
              <i className="fa fa-map fa-lg mt-3"></i> Aerial Map
            </CardHeader>
            <CardBody>
              {data && mapSelected === "aerial" && <LocationMap data={data} />}
              {data && mapSelected === "edit" && (
                <LocationEditMap data={data} refetch={refetch} />
              )}
            </CardBody>
          </Card>
        </Col>
        <DataTable
          dataMap={locationDataMap}
          dataTable={"atd_txdot_locations"}
          formData={formData}
          setEditField={setEditField}
          editField={editField}
          handleInputChange={handleInputChange}
          handleFieldUpdate={handleFieldUpdate}
          data={data}
        />
      </Row>
      <Row>
        <Col>
          <LocationCrashes locationId={locationId} />
        </Col>
      </Row>
      <Row>
        <Col>
          <LocationNonCR3Crashes locationId={locationId} />
        </Col>
      </Row>
    </div>
  );
}

export default withApollo(Location);

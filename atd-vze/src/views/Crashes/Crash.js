import React, { useState, setState } from "react";
import { Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap";
import { withApollo, Mutation } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";
import { crashDataMap, geoFields } from "./crashDataMap";
import CrashCollapses from "./CrashCollapses";
import CrashMap from "./CrashMap";
import Widget02 from "../Widgets/Widget02";

import { GET_CRASH, UPDATE_CRASH } from "../../queries/crashes";
import "./crash.scss";

const calculateYearsLifeLost = people => {
  // Assume 75 year life expectancy,
  // Find the differance between person.prsn_age & 75
  // Sum over the list of ppl with .reduce
  return people.reduce((accumulator, person) => {
    let years = 0;
    if (person.injury_severity.injry_sev_desc === "KILLED") {
      let yearsLifeLost = 75 - Number(person.prsn_age);
      // What if the person is older than 75?
      // For now, so we don't have negative numbers,
      // Assume years of life lost is 0
      years = yearsLifeLost < 0 ? 0 : yearsLifeLost;
    }
    return accumulator + years;
  }, 0); // start with a count at 0 years
};

function Crash(props) {
  const crashId = props.match.params.id;
  const { loading, error, data } = useQuery(GET_CRASH, {
    variables: { crashId },
  });
  const [editField, setEditField] = useState("");
  const [formData, setFormData] = useState({});

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  const deathCount = data.atd_txdot_crashes[0].death_cnt;
  const injuryCount = data.atd_txdot_crashes[0].tot_injry_cnt;

  const yearsLifeLostCount = calculateYearsLifeLost(
    data.atd_txdot_primaryperson.concat(data.atd_txdot_person)
  );

  const handleInputChange = e => {
    const newFormState = Object.assign(formData, {
      [editField]: e.target.value,
    });
    setFormData(newFormState);
  };

  return (
    <div className="animated fadeIn">
      <Row>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={deathCount + ""}
            mainText="Fatalities"
            icon="fa fa-heartbeat"
            color="danger"
          />
        </Col>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={injuryCount + ""}
            mainText="Serious Injuries"
            icon="fa fa-medkit"
            color="warning"
          />
        </Col>
        <Col xs="12" sm="6" md="4">
          <Widget02
            header={yearsLifeLostCount + ""}
            mainText="Years of Life Lost"
            icon="fa fa-hourglass-end"
            color="info"
          />
        </Col>
      </Row>
      <Row>
        <Col lg={6}>
          <div className="mb-4">
            <Card>
              <CardHeader>Crash Location</CardHeader>
              <CardBody>
                <CrashMap data={data.atd_txdot_crashes[0]} />
                <Table responsive striped hover>
                  <tbody>
                    {geoFields.fields.map(field => {
                      const value =
                        data.atd_txdot_crashes[0][field.data][
                          `${field.data}_desc`
                        ] || data.atd_txdot_crashes[0][field.data];
                      const isEditing = field.data === editField;
                      return (
                        <tr>
                          <td>{field.label}</td>
                          <td>
                            {isEditing ? (
                              <Mutation mutation={UPDATE_CRASH}>
                                {(updateCrash, { loading, data }) => {
                                  return (
                                    <form
                                      onSubmit={e => {
                                        e.preventDefault();
                                        debugger;
                                        updateCrash({
                                          variables: { changes: formData },
                                        });
                                        setEditField("");
                                      }}
                                    >
                                      <input
                                        type="text"
                                        defaultValue={
                                          (formData && formData[field.data]) ||
                                          value
                                        }
                                        onChange={e => handleInputChange(e)}
                                        // ref={n => (input = n)}
                                      />

                                      {isEditing && (
                                        <button type="submit">
                                          <i
                                            className="fa fa-check edit-toggle"
                                            // onClick={e => handleCheckClick(e)}
                                          />
                                        </button>
                                      )}
                                    </form>
                                  );
                                }}
                              </Mutation>
                            ) : (
                              (formData && formData[field.data]) || value
                            )}
                          </td>
                          <td>
                            {field.editable && !isEditing && (
                              <i
                                className="fa fa-pencil edit-toggle"
                                onClick={() => setEditField(field.data)}
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </div>
          <CrashCollapses data={data} />
        </Col>
        <Col lg={6}>
          {crashDataMap.map(section => {
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
                                {data.atd_txdot_crashes[0][field]}
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
      </Row>
    </div>
  );
}

export default withApollo(Crash);

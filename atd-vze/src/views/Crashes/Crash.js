import React from "react";
import { Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap";
import { withApollo } from "react-apollo";
import { useQuery } from "@apollo/react-hooks";
import crashDataMap from "./crashDataMap";
import CrashCollapses from "./CrashCollapses";
import CrashMap from "./CrashMap";

import { GET_CRASH } from "../../queries/crashes";
    }
  }
`;

function Crash(props) {
  const crashId = props.match.params.id;
  const { loading, error, data } = useQuery(GET_CRASH, {
    variables: { crashId },
  });

  if (loading) return "Loading...";
  if (error) return `Error! ${error.message}`;

  return (
    <div className="animated fadeIn">
      <Row>
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

        <Col lg={6}>
          <div className="mb-4">
            <Card>
              <CardHeader>Crash Location</CardHeader>
              <CardBody>
                <CrashMap data={data.atd_txdot_crashes[0]} />
              </CardBody>
            </Card>
          </div>
          <CrashCollapses data={data} />
        </Col>
      </Row>
    </div>
  );
}

export default withApollo(Crash);

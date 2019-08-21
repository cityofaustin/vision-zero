import React from "react";
import { Button, Badge, Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap";
import { Link } from "react-router-dom";

import { useQuery } from "@apollo/react-hooks";
import { withApollo } from "react-apollo";

import {GET_CRASHES_QA} from "../../queries/CrashesQA";

const columns = [
    "Crash Id",
    "Crash Date",
    "Address",
    "Total Injury Count",
    "Death Count",
];

function CrashesQAData (props) {
    const { loading, error, data } = useQuery(GET_CRASHES_QA,
        {
            variables: {
                recordLimit: props.state.limit,
                recordOffset: props.state.offset
            }
        });
    if (loading) return "Loading...";
    if (error) return `Error! ${error.message}`;

    return (
        <div className="animated fadeIn">
            <Row>
                <Col>
                    <Card>
                        <CardHeader>
                            <i className="fa fa-car" /> Fatalities/Serious Injuries without Coordinates

                            <span className={"float-right"}><Badge style={{marginLeft: "20px"}} color={"default"}>Limit: {props.state.limit}</Badge></span>
                            <span className={"float-right"}><Badge style={{marginLeft: "20px"}} color={"default"}>Offset: {props.state.offset}</Badge></span>
                            <span className={"float-right"}><Badge style={{marginLeft: "20px"}} color={"default"}>Page: {props.state.page}</Badge></span>
                            <Button onClick={props.moveNext} style={{marginLeft: "20px"}} className={"float-right"} color={"primary"} size={"sm"}>Next Page</Button>
                            <Button onClick={props.moveBack} className={"float-right"} color={"primary"} size={"sm"}>Previous Page</Button>
                        </CardHeader>
                        <CardBody>
                            <Table responsive>
                                <thead>
                                <tr>
                                    {columns.map((col, i) => (
                                        <th key={`th-${i}`}>{col}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {data.atd_txdot_crashes.map(crash => (
                                    <tr key={crash.crash_id}>
                                        <td>
                                            <Link to={`/crashes/${crash.crash_id}`}>
                                                {crash.crash_id}
                                            </Link>
                                        </td>
                                        <td>{crash.crash_date}</td>
                                        <td>{`${crash.rpt_street_pfx} ${crash.rpt_street_name} ${crash.rpt_street_sfx}`}</td>
                                        <td>
                                            <Badge color="warning">{crash.tot_injry_cnt}</Badge>
                                        </td>
                                        <td>
                                            <Badge color="danger">{crash.death_cnt}</Badge>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </div>
    );

}

export default withApollo(CrashesQAData);

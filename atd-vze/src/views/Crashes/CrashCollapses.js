import React, { Component } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
  Table,
  Row
} from "reactstrap";

class CrashCollapses extends Component {
  constructor(props) {
    super(props);
    this.onEntering = this.onEntering.bind(this);
    this.onEntered = this.onEntered.bind(this);
    this.onExiting = this.onExiting.bind(this);
    this.onExited = this.onExited.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleAccordion = this.toggleAccordion.bind(this);
    this.toggleCustom = this.toggleCustom.bind(this);
    this.toggleFade = this.toggleFade.bind(this);
    this.state = {
      collapse: false,
      accordion: [false, false, false],
      custom: [true, false],
      status: "Closed",
      fadeIn: true,
      timeout: 300
    };
  }

  onEntering() {
    this.setState({ status: "Opening..." });
  }

  onEntered() {
    this.setState({ status: "Opened" });
  }

  onExiting() {
    this.setState({ status: "Closing..." });
  }

  onExited() {
    this.setState({ status: "Closed" });
  }

  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }

  toggleAccordion(tab) {
    const prevState = this.state.accordion;
    const state = prevState.map((x, index) => (tab === index ? !x : false));

    this.setState({
      accordion: state
    });
  }

  toggleCustom(tab) {
    const prevState = this.state.custom;
    const state = prevState.map((x, index) => (tab === index ? !x : false));

    this.setState({
      custom: state
    });
  }

  toggleFade() {
    this.setState({ fadeIn: !this.state.fadeIn });
  }

  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col>
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify" /> Related Records
              </CardHeader>
              <CardBody>
                <div id="accordion">
                  <Card className="mb-0">
                    <CardHeader id="headingOne">
                      <Button
                        block
                        color="link"
                        className="text-left m-0 p-0"
                        onClick={() => this.toggleAccordion(0)}
                        aria-expanded={this.state.accordion[0]}
                        aria-controls="collapseOne"
                      >
                        <h5 className="m-0 p-0">
                          <i className="fa fa-group" /> People
                        </h5>
                      </Button>
                    </CardHeader>
                    <Collapse
                      isOpen={this.state.accordion[0]}
                      data-parent="#accordion"
                      id="collapseOne"
                      aria-labelledby="headingOne"
                    >
                      <CardBody>
                        <h5>Drivers/Primary People</h5>

                        <Table responsive>
                          <thead>
                            <tr>
                              <th>City</th>
                              <th>ZIP</th>
                              <th>Age</th>
                              <th>Injury Severity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.props.data.atd_txdot_primaryperson.map(
                              (person, i) => (
                                <tr key={`person-${i}`}>
                                  <td>{person.drvr_city_name}</td>
                                  <td>{person.drvr_zip}</td>
                                  <td>{person.prsn_age}</td>
                                  <td>
                                    <Badge color="success">
                                      {person.prsn_injry_sev_id}
                                    </Badge>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </Table>

                        {this.props.data.atd_txdot_person.length > 0 && (
                          <h5>Other People</h5>
                        )}
                        {this.props.data.atd_txdot_person.map(person => (
                          <Table responsive>
                            <thead>
                              <tr>
                                <th>City</th>
                                <th>ZIP</th>
                                <th>Age</th>
                                <th>Injury Severity</th>
                              </tr>
                            </thead>
                            <tbody>
                              {this.props.data.atd_txdot_primaryperson.map(
                                person => (
                                  <tr>
                                    <td>{person.drvr_city_name}</td>
                                    <td>{person.drvr_zip}</td>
                                    <td>{person.prsn_age}</td>
                                    <td>
                                      <Badge color="success">
                                        {person.prsn_injry_sev_id}
                                      </Badge>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </Table>
                        ))}
                      </CardBody>
                    </Collapse>
                  </Card>
                  <Card className="mb-0">
                    <CardHeader id="headingTwo">
                      <Button
                        block
                        color="link"
                        className="text-left m-0 p-0"
                        onClick={() => this.toggleAccordion(1)}
                        aria-expanded={this.state.accordion[1]}
                        aria-controls="collapseTwo"
                      >
                        <h5 className="m-0 p-0">
                          <i className="fa fa-car" /> Units
                        </h5>
                      </Button>
                    </CardHeader>
                    <Collapse
                      isOpen={this.state.accordion[1]}
                      data-parent="#accordion"
                      id="collapseTwo"
                    >
                      <CardBody>
                        <Table responsive>
                          <thead>
                            <tr>
                              <th>Unit Type</th>
                              <th>Factor 1</th>
                              <th>Make/Model</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.props.data.atd_txdot_units.map((unit, i) => (
                              <tr key={`person-${i}`}>
                                <td>{unit.unit_desc_id}</td>
                                <td>{unit.contrib_factr_1_id}</td>
                                <td>
                                  {unit.veh_mod_year} {unit.veh_make_id}{" "}
                                  {unit.veh_mod_id}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </CardBody>
                    </Collapse>
                  </Card>
                  <Card className="mb-0">
                    <CardHeader id="headingThree">
                      <Button
                        block
                        color="link"
                        className="text-left m-0 p-0"
                        onClick={() => this.toggleAccordion(2)}
                        aria-expanded={this.state.accordion[2]}
                        aria-controls="collapseThree"
                      >
                        <h5 className="m-0 p-0">
                          <i className="fa fa-legal" /> Charges
                        </h5>
                      </Button>
                    </CardHeader>
                    <Collapse
                      isOpen={this.state.accordion[2]}
                      data-parent="#accordion"
                      id="collapseThree"
                    >
                      <CardBody>
                        <Table responsive>
                          <thead>
                            <tr>
                              <th>Charge</th>
                              <th>Charge Category</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.props.data.atd_txdot_charges.map(
                              (charges, i) => (
                                <tr key={`charges-${i}`}>
                                  <td>{charges.charge}</td>
                                  <td>{charges.charge_cat_id}</td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </Table>
                      </CardBody>
                    </Collapse>
                  </Card>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default CrashCollapses;

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
  Row,
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
      timeout: 300,
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
      accordion: state,
    });
  }

  toggleCustom(tab) {
    const prevState = this.state.custom;
    const state = prevState.map((x, index) => (tab === index ? !x : false));

    this.setState({
      custom: state,
    });
  }

  toggleFade() {
    this.setState({ fadeIn: !this.state.fadeIn });
  }

  getInjurySeverityColor(desc) {
    switch (desc) {
      case "UNKNOWN":
        return "muted";
      case "NOT INJURED":
        return "primary";
      case "INCAPACITATING INJURY":
        return "warning";
      case "NON-INCAPACITATING INJURY":
        return "warning";
      case "POSSIBLE INJURY":
        return "warning";
      case "KILLED":
        return "danger";
      default:
        break;
    }
  }

  getUnitType(type) {
    switch (type) {
      case "MOTOR VEHICLE":
        return <i className="fa fa-car" />;
      case "TRAIN":
        return <i className="fa fa-train" />;
      case "PEDALCYCLIST":
        return <i className="fa fa-bicycle" />;
      case "PEDESTRIAN":
        return <i className="fa fa-child" />;
      case "MOTORIZED CONVEYANCE":
        return "MOTORIZED CONVEYANCE";
      case "TOWED/PUSHED/TRAILER":
        return "TOWED/PUSHED/TRAILER";
      case "NON-CONTACT":
        return "NON-CONTACT";
      case "OTHER (EXPLAIN IN NARRATIVE)":
        return "Other";
      default:
        break;
    }
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
                          <i className="fa fa-group" /> People{" "}
                          <Badge color="secondary float-right">
                            {
                              this.props.data.atd_txdot_primaryperson.concat(
                                this.props.data.atd_txdot_person
                              ).length
                            }
                          </Badge>
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
                              <th>Unit</th>
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
                                  <td>{person.unit_nbr}</td>
                                  <td>{person.drvr_city_name}</td>
                                  <td>{person.drvr_zip}</td>
                                  <td>{person.prsn_age}</td>
                                  <td>
                                    <Badge
                                      color={this.getInjurySeverityColor(
                                        person.injury_severity.injry_sev_desc
                                      )}
                                    >
                                      {person.injury_severity.injry_sev_desc}
                                    </Badge>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </Table>

                        {this.props.data.atd_txdot_person.length > 0 && (
                          <>
                            <h5>Other People</h5>
                            <Table responsive>
                              <thead>
                                <tr>
                                  <th>Unit</th>
                                  <th>Age</th>
                                  <th>Injury Severity</th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.props.data.atd_txdot_person.map(
                                  person => (
                                    <tr>
                                      <td>{person.unit_nbr}</td>
                                      <td>{person.prsn_age}</td>
                                      <td>
                                        <Badge
                                          color={this.getInjurySeverityColor(
                                            person.injury_severity
                                              .injry_sev_desc
                                          )}
                                        >
                                          {
                                            person.injury_severity
                                              .injry_sev_desc
                                          }
                                        </Badge>
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </Table>
                          </>
                        )}
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
                          <Badge color="secondary float-right">
                            {this.props.data.atd_txdot_units.length}
                          </Badge>
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
                              <th>Unit</th>
                              <th>Type</th>
                              <th>Body Style</th>
                              <th>Factor 1</th>
                              <th>Make/Model</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.props.data.atd_txdot_units.map((unit, i) => (
                              <tr key={`person-${i}`}>
                                <td>{unit.unit_nbr}</td>
                                <td>
                                  {this.getUnitType(
                                    unit.unit_description.veh_unit_desc_desc
                                  )}
                                </td>
                                <td>{unit.body_style.veh_body_styl_desc}</td>
                                <td>{unit.contrib_factr_1_id}</td>
                                <td>
                                  {unit.veh_mod_year} {unit.make.veh_make_desc}{" "}
                                  {unit.model.veh_mod_desc}
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
                          <Badge color="secondary float-right">
                            {
                              this.props.data.atd_txdot_charges.filter(
                                charge => charge.charge_cat_id !== 0
                              ).length
                            }
                          </Badge>
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

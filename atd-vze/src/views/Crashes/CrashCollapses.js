import React, { Component } from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";

import UnitDetailsCard from "./UnitDetailsCard";
import PeopleDetailsCard from "./PeopleDetailsCard";
import ChargesDetailsCard from "./ChargesDetailsCard";

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
      accordion: [true, false, false],
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
                  <UnitDetailsCard
                    isExpanded={this.state.accordion[0]}
                    toggleAccordion={this.toggleAccordion}
                    {...this.props.props}
                  />
                  <PeopleDetailsCard
                    isExpanded={this.state.accordion[1]}
                    toggleAccordion={this.toggleAccordion}
                    {...this.props.props}
                  />
                  <ChargesDetailsCard
                    chargesData={this.props.data.atd_txdot_charges}
                    isExpanded={this.state.accordion[2]}
                    toggleAccordion={this.toggleAccordion}
                  />
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

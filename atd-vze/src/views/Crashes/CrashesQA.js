import React, {Component} from "react";
import { Button, Badge, Card, CardBody, CardHeader, Col, Row, Table } from "reactstrap";
import { Link } from "react-router-dom";

import CrashesQAData from  "./CrashesQAData"

class CrashesQA extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      limit: 25,
      offset: 0
    }
  }

  moveNext = () => {
    const page = this.state.page;
    const oldOffset = this.state.offset;
    const newOffset = ((page + 1) * this.state.limit) - this.state.limit;
    this.setState({
      page: page + 1,
      offset: newOffset
    });
    console.log("oldOffset: " + oldOffset);
    console.log("newOffset: " + newOffset);
  }

  moveBack = () => {
    // Only if we have space to move back...
    if(this.state.page == 1) {
      this.setState({
        page: 1,
        offset: 0
      });
      return;
    }

    // If we do, then go ahead
    const oldOffset = this.state.offset;
    const newOffset = (this.state.page -1) * this.state.limit;
    this.setState({
      page: (this.state.page - 1),
      offset: newOffset
    });
    console.log("oldOffset: " + oldOffset);
    console.log("newOffset: " + newOffset);
  }

  render() {
    return (
        <CrashesQAData state={this.state} moveNext={this.moveNext} moveBack={this.moveBack} />
    );
  }
}

export default CrashesQA;

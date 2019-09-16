import React, { Component } from "react";

import CrashesQAData from "./CrashesQAData";

class CrashesQA extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      limit: 25,
      offset: 0,
    };
  }

  moveNext = () => {
    this.setPage(Number(this.state.page) + 1);
  };

  moveBack = () => {
    this.setPage(Number(this.state.page) - 1);
  };

  setPage = pagenum => {
    // If we do, then go ahead
    const oldOffset = this.state.offset;
    const newOffset = pagenum * this.state.limit - this.state.limit;
    this.setState({
      page: pagenum,
      offset: newOffset,
    });
  };

  changePage = event => {
    this.setPage(event.target.value);
  };

  render() {
    return (
      <CrashesQAData
        state={this.state}
        moveNext={this.moveNext}
        moveBack={this.moveBack}
        changePage={this.changePage}
      />
    );
  }
}

export default CrashesQA;

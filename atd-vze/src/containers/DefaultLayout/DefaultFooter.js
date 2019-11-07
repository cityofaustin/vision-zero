import React, { Component } from "react";
import PropTypes from "prop-types";
var pckg = require("../../../package.json");

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultFooter extends Component {
  render() {
    // eslint-disable-next-line
    const { children, ...attributes } = this.props;

    return (
      <React.Fragment>
        <span>
          {pckg.name} v{pckg.version}
        </span>
        <span className="ml-auto">
          Powered by{" "}
          <a href="https://transportation.austintexas.io/about/">
            ATD Data & Technology Services
          </a>
        </span>
      </React.Fragment>
    );
  }
}

DefaultFooter.propTypes = propTypes;
DefaultFooter.defaultProps = defaultProps;

export default DefaultFooter;

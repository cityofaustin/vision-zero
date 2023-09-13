import React from "react";
import { withApollo } from "react-apollo";
import {
  Button,
  Col,
  Container,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
  NavLink,
} from "reactstrap";
import Icon404 from "../../../assets/img/brand/404.svg";

const Page404 = () => {
  return (
    <div className="app flex justify-content-center align-items-center animated fadeIn">
      <Row className="mb-5">
        <img alt="404" height="125px" src={Icon404} />
      </Row>
      <Row className="mb-2">
        <h1 className="font-weight-bold">Page Not Found</h1>
      </Row>
      <Row className="mb-3 text-muted">
        <h4>Sorry, we couldn't find the page you were looking for.</h4>
      </Row>
      <Row>
        <NavLink href="#/dashboard" className="btn btn-primary">
          Back to Homepage
        </NavLink>
      </Row>
    </div>
  );
};

export default withApollo(Page404);

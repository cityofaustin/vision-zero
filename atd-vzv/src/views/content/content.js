import React from "react";
import classNames from "classnames";
import { Container, Row, Col, Alert } from "reactstrap";
import { useRoutes } from "hookrouter";
import { routes } from "../../routes/routes";
import Header from "../nav/header";
import NotFound from "../NotFound/NotFound";

const Content = ({ toggle, isOpen }) => {
  const routeResult = useRoutes(routes);

  return (
    <Container
      fluid
      className={classNames("content", "bg-light", { "is-open": isOpen })}
    >
      <Header toggleSidebar={toggle} />
      <Row>
        <Col md="12">
          <Alert color="primary">
            <h4 className="alert-heading">This site is a work in progress.</h4>
            <p>
              The information displayed below may be outdated or incorrent.
              <br></br>
              Check back later for live Vision Zero data.
            </p>
          </Alert>
        </Col>
      </Row>
      {routeResult || <NotFound />}
    </Container>
  );
};

export default Content;

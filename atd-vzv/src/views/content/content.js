import React from "react";
import { useRoutes } from "hookrouter";
import { routes } from "../../routes/routes";
import Header from "../nav/header";
import NotFound from "../NotFound/NotFound";

import { Container, Row, Col, Alert } from "reactstrap";
import styled from "styled-components";
import classNames from "classnames";

const StyledContent = styled.div`
  .content {
    padding: 20px;
    margin-left: 0;
    height: 100vh;
  }
`;

const Content = ({ toggle, isOpen }) => {
  const routeResult = useRoutes(routes);

  return (
    <StyledContent>
      {/* Use classNames to toggle "is-name" classname if sidebar isOpen */}
      <Container
        fluid
        className={classNames("content", "bg-light", { "is-open": isOpen })}
      >
        <Header toggleSidebar={toggle} />
        {/* TODO: Remove disclaimer  */}
        <Row>
          <Col md="12">
            <Alert color="primary">
              <h4 className="alert-heading">
                This site is a work in progress.
              </h4>
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
    </StyledContent>
  );
};

export default Content;

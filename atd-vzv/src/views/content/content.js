import React from "react";
import { useRoutes } from "hookrouter";
import { routes } from "../../routes/routes";
import Header from "../nav/header";
import NotFound from "../NotFound/NotFound";

import { Container, Row, Col, Alert } from "reactstrap";
import styled from "styled-components";
import { drawer } from "../../constants/drawer";

const StyledContent = styled.div`
  .content {
    padding: 20px;
    margin-left: 0;
    height: 100vh;
    width: calc(100vw - ${drawer.width});
    overflow-y: scroll;
  }
`;

const Content = ({ toggle }) => {
  const routeResult = useRoutes(routes);

  return (
    <StyledContent>
      <Container fluid className="content bg-light">
        <Header toggleSidebar={toggle} />
        {/* TODO: Remove disclaimer  */}
        <Row>
          <Col md="12">
            <Alert color="primary" className="m-2">
              <h4 className="alert-heading">
                This site is a work in progress.
              </h4>
              <p>
                The information displayed below may be outdated or incorrect.
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

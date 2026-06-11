import React from "react";

import { Container, Row } from "reactstrap";

const NotFound = () => {
  return (
    <Container style={{ width: "100vw" }}>
      <Row className="my-5 mx-5">
        <h3>Sorry, but this page does not exist.</h3>
      </Row>
    </Container>
  );
};

export default NotFound;

import React from "react";
import { useRoutes } from "hookrouter";
import { routes } from "../../routes/routes";
import Header from "../nav/header";
import NotFound from "../NotFound/NotFound";

import { Container } from "reactstrap";
import styled from "styled-components";
import { drawer } from "../../constants/drawer";

const StyledContent = styled.div`
  .content {
    padding: 0px;
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

        {routeResult || <NotFound />}
      </Container>
    </StyledContent>
  );
};

export default Content;

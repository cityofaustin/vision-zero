import React from "react";
import { useRoutes } from "hookrouter";
import { routes } from "../../routes/routes";
import Header from "../nav/header";
import NotFound from "../NotFound/NotFound";

import { Container } from "reactstrap";
import styled from "styled-components";
import { drawer } from "../../constants/drawer";
import { responsive } from "../../constants/responsive";

const StyledContent = styled.div`
  .content {
    padding: 0px;
    width: calc(100vw - ${drawer.width}px);
    height: calc(100vh - ${drawer.headerHeight}px);
  }

  @media only screen and (max-width: ${responsive.sm}px) {
    .content {
      width: 100vw;
      height: calc(100vh - ${drawer.headerHeight}px);
    }
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

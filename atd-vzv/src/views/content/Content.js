import React from "react";
import { useRoutes, usePath } from "hookrouter";
import { routes } from "../../routes/routes";
import Header from "../nav/Header";
import NotFound from "../NotFound/NotFound";

import { Container } from "reactstrap";
import styled from "styled-components";
import { drawer } from "../../constants/drawer";
import { responsive } from "../../constants/responsive";

const Content = ({ toggle }) => {
  const routeResult = useRoutes(routes);
  const currentPath = usePath();

  const StyledContent = styled.div`
    .content {
      padding: 0px;
      width: calc(100vw - ${drawer.width}px);
      height: calc(100vh - ${drawer.headerHeight}px);
      /* overflow-y: scroll style breaks Map */
      ${currentPath !== "/map" && `overflow-y: scroll;`}
    }

    /* Fill space left behind by SideDrawer on mobile */
    @media only screen and (max-width: ${responsive.md}px) {
      .content {
        width: 100vw;
        height: calc(100vh - ${drawer.headerHeight}px);
        /* overflow-y: scroll style breaks Map */
        ${currentPath !== "/map" && `overflow-y: scroll;`}
      }
    }
  `;

  return (
    <StyledContent>
      <Container fluid className="content">
        <Header toggleSidebar={toggle} />
        {routeResult || <NotFound />}
      </Container>
    </StyledContent>
  );
};

export default Content;

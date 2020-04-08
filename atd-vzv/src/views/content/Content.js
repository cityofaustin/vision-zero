import React from "react";
import { useRoutes, usePath } from "hookrouter";
import { routes } from "../../routes/routes";
import Header from "../nav/Header";
import NotFound from "../NotFound/NotFound";

import { Container, Row } from "reactstrap";
import styled from "styled-components";
import { drawer } from "../../constants/drawer";
import { responsive } from "../../constants/responsive";

const Content = () => {
  const routeResult = useRoutes(routes);
  const currentPath = usePath();

  // TODO: Slide content to the right when SideDrawer opens
  // Adding conditional styles based on sidebarToggle in the store causes children to re-render on toggle
  // which causes map or summary views to refetch all data on sidebar toggle
  // https://github.com/facebook/react/issues/14110

  // Map view needs to consider header height and have no overflow scroll to fill view
  // Non-map views need to scroll to show all content
  const mapStyles = `
    height: calc(100vh - ${drawer.headerHeight}px);
    width: calc(100vw - ${drawer.width}px);
    padding: 0px;
  `;

  const summaryStyles = `
    width: 100vw;
    height: 100vh;
    overflow-y: scroll; 
  `;

  const StyledContent = styled.div`
    .content {
      top: ${drawer.headerHeight}px;
      ${currentPath === "/" && summaryStyles}
      ${currentPath === "/map" && mapStyles}
    }

    /* Fill space left behind by SideDrawer on mobile */
    @media only screen and (max-width: ${responsive.bootstrapMedium}px) {
      .content {
        width: 100vw;
      }
    }
  `;

  return (
    <StyledContent>
      <Container fluid className="content ">
        <Row className="px-xs-0 px-lg-5 mx-lg-5">
          <Header />
          {routeResult || <NotFound />}
        </Row>
      </Container>
    </StyledContent>
  );
};

export default Content;

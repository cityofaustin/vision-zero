import React from "react";
import { usePath } from "hookrouter";
import { useTrackedRoutes } from "../../constants/nav";
import { routes } from "../../routes/routes";
import Header from "../nav/Header";
import Footer from "../nav/Footer";
import NotFound from "../NotFound/NotFound";

import { Container } from "reactstrap";
import styled from "styled-components";
import { responsive } from "../../constants/responsive";

const Content = () => {
  const routeResult = useTrackedRoutes(routes);
  const currentPath = usePath();
  const isMapPath = currentPath === "/map";

  // TODO: Slide content to the right when SideDrawer opens
  // Adding conditional styles based on sidebarToggle in the store causes children to re-render on toggle
  // which causes map or summary views to refetch all data on sidebar toggle
  // https://github.com/facebook/react/issues/14110

  // Map view needs to consider header height and have no overflow scroll to fill view
  // Summary view needs to scroll to show all content
  const mapStyles = `
    height: calc(100vh - ${responsive.headerHeight}px);
    width: calc(100vw - ${responsive.drawerWidth}px);
  `;

  const StyledContent = styled.div`
    .content {
      position: relative;
      top: ${responsive.headerHeight}px;
      ${isMapPath && mapStyles}
    }

    /* Fill space left behind by SideDrawer on mobile */
    @media only screen and (max-width: ${responsive.bootstrapMedium}px) {
      .content {
        width: 100vw;
        height: 100%;
        height: -webkit-calc(100% - ${responsive.headerHeightMobile}px);
        height: -moz-calc(100% - ${responsive.headerHeightMobile}px);
        height: calc(100% - ${responsive.headerHeightMobile}px);
        top: ${responsive.headerHeightMobile}px;
      }
    }
  `;

  return (
    <>
      <Header />
      <StyledContent>
        {/* Remove padding from all content */}
        <Container fluid className="content px-0">
          {routeResult || <NotFound />}
          {!isMapPath && <Footer />}
        </Container>
      </StyledContent>
    </>
  );
};

export default Content;

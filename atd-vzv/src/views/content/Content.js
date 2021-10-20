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
  const isMeasuresPath = currentPath === "/measures";

  // TODO: Slide content to the right when SideDrawer opens
  // Adding conditional styles based on sidebarToggle in the store causes children to re-render on toggle
  // which causes map or summary views to refetch all data on sidebar toggle
  // https://github.com/facebook/react/issues/14110

  // Map view needs to consider header height and have no overflow scroll to fill view
  // Summary view needs to scroll to show all content
  const mapStyles = `
    position: fixed;
    height: calc(100% - ${responsive.headerHeight}px);
    width: calc(100vw - ${responsive.drawerWidth}px);
  `;

  const mainSyles = `
    top: ${responsive.headerHeight}px;
  `;

  const mainMobileStilye = `
    top: ${responsive.headerHeightMobile}px;
  `;

  const StyledContent = styled.div`
    .content {
      position: relative;
      ${!isMeasuresPath && mainSyles}
      ${isMapPath && mapStyles}
    }

    /* Fill space left behind by SideDrawer on mobile */
    @media only screen and (max-width: ${responsive.bootstrapMedium}px) {
      .content {
        width: 100vw;
        height: calc(100% - ${responsive.headerHeightMobile}px);
        ${!isMeasuresPath && mainMobileStilye}
      }
    }
  `;

  return (
    <>
      {!isMeasuresPath && <Header />}
      <StyledContent>
        {/* Remove padding from all content */}
        <Container fluid className="content px-0">
          {routeResult || <NotFound />}
          {!isMapPath && !isMeasuresPath && <Footer />}
        </Container>
      </StyledContent>
    </>
  );
};

export default Content;

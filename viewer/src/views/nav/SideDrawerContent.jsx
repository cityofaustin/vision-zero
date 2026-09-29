import React from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import SideMapControl from "./SideMapControl";
import SideMapFooter from "./SideMapFooter";
import SideDrawerMobileNav from "./SideDrawerMobileNav";
import { Container } from "reactstrap";
import { colors } from "../../constants/colors";
import { responsive } from "../../constants/responsive";

const LOGO_URL = `${import.meta.env.BASE_URL}vz_logo.png`;

const StyledDrawerHeader = styled.div`
  background-color: ${colors.white};
  color: ${colors.dark};
  padding: 20px;
  height: ${responsive.headerHeight}px;
  display: flex;
  align-items: center;
  justify-content: center;
  @media only screen and (max-width: ${responsive.bootstrapMedium}px) {
    display: none;
  }
  .vz-logo {
    height: 40px;

    @media only screen and (max-width: ${responsive.bootstrapMedium}px) {
      height: 30px;
    }
  }
`;

const SideDrawerContent = ({ type }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="side-menu">
      <StyledDrawerHeader>
        <h1 className="sr-only">
          Vision Zero Map -- Help Austin reach zero traffic deaths
        </h1>
        <img
          className="vz-logo"
          src={LOGO_URL}
          alt="Vision Zero Austin Logo"
          key="vz-logo-static"
        />
      </StyledDrawerHeader>
      <div className="drawer-content shadow">
        <Container className="pt-3 pb-3">
          <SideDrawerMobileNav />
          {currentPath === "/map" && <SideMapControl type={type} />}
        </Container>
        {currentPath === "/map" && <SideMapFooter />}
      </div>
    </div>
  );
};

export default SideDrawerContent;

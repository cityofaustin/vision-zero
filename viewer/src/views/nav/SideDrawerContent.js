import React from "react";
import { usePath } from "hookrouter";
import styled from "styled-components";
import SideMapControl from "./SideMapControl";
import SideDrawerMobileNav from "./SideDrawerMobileNav";
import { Container } from "reactstrap";
import { colors } from "../../constants/colors";
import { responsive } from "../../constants/responsive";

const LOGO_URL = `${process.env.PUBLIC_URL}/vz_logo.png`;

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
  const currentPath = usePath();

  return (
    <div className="side-menu">
      <StyledDrawerHeader>
        <img
          className="vz-logo"
          src={LOGO_URL}
          alt="Vision Zero Austin Logo"
          key="vz-logo-static"
        />
      </StyledDrawerHeader>
      <Container className="pt-3 pb-3 drawer-content">
        <SideDrawerMobileNav />
        {currentPath === "/map" && <SideMapControl type={type} />}
      </Container>
    </div>
  );
};

export default SideDrawerContent;

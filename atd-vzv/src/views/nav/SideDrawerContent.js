import React from "react";
import { usePath } from "hookrouter";
import styled from "styled-components";
import SideMapControl from "./SideMapControl";
import SideDrawerMobileNav from "./SideDrawerMobileNav";
import { Container } from "reactstrap";
import { colors } from "../../constants/colors";
import { responsive } from "../../constants/responsive";

const SideDrawerContent = ({ type }) => {
  const currentPath = usePath();

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
      height: ${responsive.headerButtonHeight + responsive.headerLogoOffset}px;
    }
  `;

  return (
    <div className="side-menu">
      <StyledDrawerHeader>
        {/* Need to adjust location of public folder to account for /viewer/ basepath */}
        <img
          className="vz-logo"
          src={process.env.PUBLIC_URL + "/vz_logo.svg"}
          alt="Vision Zero Austin Logo"
        ></img>
      </StyledDrawerHeader>
      <Container className="pt-3 pb-3 drawer-content">
        <SideDrawerMobileNav />
        {currentPath === "/map" && <SideMapControl type={type} />}
      </Container>
    </div>
  );
};

export default SideDrawerContent;

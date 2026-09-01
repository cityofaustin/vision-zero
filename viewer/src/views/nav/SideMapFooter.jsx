import React from "react";
import styled from "styled-components";
import logo from "./COA-Logo-Stacked-Faded-White-RGB.svg";

const FooterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Logo = styled.img`
  margin-bottom: 15px;
  margin-top: 20px;
`;

const DepartmentName = styled.div`
  font-size: 18px;
  font-family: Robot, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-bottom: 10px;
  font-weight: bold;
`;

const FeedbackLink = styled.a`
  margin-top: 10px;
  font-size: 14px;
  font-family: Robot, Helvetica, Arial, sans-serif;
  color: white;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const SideMapFooter = () => {
  return (
    <FooterContainer>
      {/* Logo */}
      <Logo
        alt="City of Austin logo"
        className="coa-seal float-left"
        height="55px"
        src={logo}
      />

      {/* Department Name */}
      <DepartmentName>
        City of Austin <br /> Transportation Public Works
      </DepartmentName>

      {/* Feedback */}
      <div>
        <FeedbackLink href="mailto:transportation.data@austintexas.gov">
          Give feedback on Vision Zero Viewer
        </FeedbackLink>
      </div>
    </FooterContainer>
  );
};

export default SideMapFooter;

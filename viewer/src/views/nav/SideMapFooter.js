import React from "react";
import logo from "./COA-Logo-Stacked-Faded-White-RGB.svg";

const SideMapFooter = () => {
  const footerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const logoStyle = {
    marginBottom: "15px",
    marginTop: "20px",
  };

  const nameStyle = {
    fontSize: "18px",
    fontFamily: "Robot, Helvetica, Arial, sans-serif",
    textAlign: "center",
    marginBottom: "10px",
    fontWeight: "bold",
  };

  const feedbackStyle = {
    marginTop: "10px",
    fontSize: "14px",
    fontFamily: "Robot, Helvetica, Arial, sans-serif",
    color: "white",
    cursor: "pointer",
  };

  return (
    <div className="side-map-footer" style={footerStyle}>
      {/* Logo */}
      <img style={logoStyle}
        alt="City of Austin seal"
        className="coa-seal float-left"
        height="55px"
        src={logo}
      />

      {/* Department Name */}
      <div className="department-name" style={nameStyle}>
        City of Austin <br /> Transportation Public Works
      </div>

      {/* Feedback */}
      <div className="feedback">
        <a href="mailto:transportation.data@austintexas.gov"  style={feedbackStyle}>
        Give feedback on Vision Zero Viewer
        </a>
      </div>
    </div>
  );
};

export default SideMapFooter;

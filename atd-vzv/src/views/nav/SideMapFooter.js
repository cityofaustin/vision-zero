import React from "react";
import logo from "./coa_seal_transparent_white.png";

const SideMapFooter = () => {
  const handleFeedbackClick = () => {
    window.location.href = "transportation.data@austintexas.gov";
  };

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
    fontSize: "14px",
    fontFamily: "Robot, Helvetica, Arial, sans-serif",
    textAlign: "center",
    marginBottom: "10px",
    fontWeight: "bold",
  };

  const feedbackStyle = {
    marginTop: "10px",
    fontSize: "10px",
    fontFamily: "Robot, Helvetica, Arial, sans-serif",
    color: "white", // Set color to black
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
      <div className="feedback" style={feedbackStyle} onClick={handleFeedbackClick}>
        Give feedback on Vision Zero Viewer
      </div>
    </div>
  );
};

export default SideMapFooter;

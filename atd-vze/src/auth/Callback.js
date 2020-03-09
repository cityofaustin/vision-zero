import React from "react";
import { Redirect } from "react-router-dom";

const Callback = ({ handleAuthentication, location }) => {
  debugger;
  if (/access_token|id_token|error/.test(location.hash)) {
    handleAuthentication();
  }
  return <Redirect to="/" />;
};

export default Callback;

import React, { useContext } from "react";
import { Redirect, useLocation } from "react-router-dom";
import { Auth0Provider } from "../auth/authContextStore";

const Callback = () => {
  const location = useLocation();
  const { handleAuthentication } = useContext(Auth0Provider);

  handleAuthentication();

  return <Redirect to="/" />;
};

export default Callback;

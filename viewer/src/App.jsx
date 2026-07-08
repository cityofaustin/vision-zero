import React from "react";
import { useLocation } from "react-router-dom";
import SideDrawer from "./views/nav/SideDrawer";
import Content from "./views/content/Content";
import UnderMaintenance from "./views/NotFound/UnderMaintenance";
import "./App.css";

const isUnderMaintenance = import.meta.env.VITE_UNDER_MAINTENANCE === "true";
console.log("Is under maintenance: ", import.meta.env.VITE_UNDER_MAINTENANCE);

const App = () => {
  const location = useLocation();
  const isMeasuresPath = location.pathname === "/measures";

  if (isUnderMaintenance) {
    return (
      <div className="App">
        <UnderMaintenance isMeasuresPath={isMeasuresPath} />
      </div>
    );
  }

  return (
    <div className="App">
      {!isMeasuresPath && <SideDrawer />}
      <Content />
    </div>
  );
};

export default App;

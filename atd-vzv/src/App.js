import React from "react";
import { usePath } from "hookrouter";
import SideDrawer from "./views/nav/SideDrawer";
import Content from "./views/content/Content";
import UnderMaintenance from "./views/NotFound/UnderMaintenance";
import "./App.css";

const isUnderMaintenance = process.env.REACT_APP_UNDER_MAINTENANCE === "true";
console.log("Is under maintenance: ", process.env.REACT_APP_UNDER_MAINTENANCE);

const App = () => {
  const currentPath = usePath();
  const isMeasuresPath = currentPath === "/measures";

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

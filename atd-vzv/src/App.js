import React from "react";
import { usePath } from "hookrouter";
import SideDrawer from "./views/nav/SideDrawer";
import Content from "./views/content/Content";

import "./App.css";
import { isMobile } from "./constants/responsive";

const App = () => {
  const currentPath = usePath();

  return (
    <div className="App">
      {((currentPath === "/" && isMobile()) || currentPath !== "/") && (
        <SideDrawer />
      )}
      <Content />
    </div>
  );
};

export default App;

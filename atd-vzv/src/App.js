import React from "react";
import SideDrawer from "./views/nav/SideDrawer";
import Content from "./views/content/content";

import "./App.css";

const App = () => {
  return (
    <div className="App">
      <SideDrawer />
      <Content />
    </div>
  );
};

export default App;

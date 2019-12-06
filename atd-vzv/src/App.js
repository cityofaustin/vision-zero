import React, { useState } from "react";
import SideDrawer from "./views/nav/sidedrawer";
import Content from "./views/content/content";

import "./App.css";

const App = () => {
  const [isOpen, setOpen] = useState(false);
  const toggle = () => setOpen(!isOpen);

  return (
    <div className="App">
      <SideDrawer toggle={toggle} isOpen={isOpen} />
      <Content toggle={toggle} isOpen={isOpen} />
    </div>
  );
};

export default App;

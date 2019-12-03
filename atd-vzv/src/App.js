import React, { useState } from "react";
import Sidebar from "./views/nav/sidebar";
import Content from "./views/content/content";

import "./App.css";

const App = () => {
  const [isOpen, setOpen] = useState(true);
  const toggle = () => setOpen(!isOpen);

  return (
    <div className="App wrapper">
      <Sidebar toggle={toggle} isOpen={isOpen} />
      <Content toggle={toggle} isOpen={isOpen} />
    </div>
  );
};

export default App;

import React, { useState } from "react";
import SideDrawer from "./views/nav/sidedrawer";
import Content from "./views/content/content";

import "./App.css";

const App = () => {
  const [isOpen, setOpen] = useState(false);
  const toggle = () => setOpen(!isOpen);

  const [mapFilters, setMapFilters] = useState([]);

  const updateMapFilters = mapFilters => {
    setMapFilters(mapFilters);
  };

  return (
    <div className="App">
      <SideDrawer
        toggle={toggle}
        isOpen={isOpen}
        updateMapFilters={updateMapFilters}
      />
      <Content toggle={toggle} isOpen={isOpen} mapFilters={mapFilters} />
    </div>
  );
};

export default App;

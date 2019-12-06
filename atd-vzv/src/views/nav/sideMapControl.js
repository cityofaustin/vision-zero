import React, { useState, useEffect } from "react";

import { Container, ButtonGroup, Button, Label } from "reactstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWalking, faMap } from "@fortawesome/free-solid-svg-icons";

const queryParameters = {
  pedestrian: {
    syntax: `&$where=pedestrian_fl = "Y"`,
    type: `where`
  }
};

const SideMapControl = ({ toggle, isOpen }) => {
  const [mapFilters, setMapFilters] = useState([]);

  // TODO: Call method to pass filters to parent here
  useEffect(() => {}, [mapFilters]);

  const handleFilterClick = event => {
    // Set filter
    // TODO: Remove filter on click when already set
    const filter = queryParameters[event.target.id];
    const filtersArray = [...mapFilters, filter];
    setMapFilters(filtersArray);
  };

  const isFilterSet = filterName => {
    const clickedFilter = queryParameters[filterName];
    return !!mapFilters.find(setFilter => setFilter === clickedFilter);
  };

  return (
    <Container className="text-center">
      <legend>Mode</legend>
      <ButtonGroup>
        <Button
          color="info"
          onClick={handleFilterClick}
          id="pedestrian"
          active={isFilterSet("pedestrian")}
        >
          <FontAwesomeIcon icon={faWalking} />
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default SideMapControl;

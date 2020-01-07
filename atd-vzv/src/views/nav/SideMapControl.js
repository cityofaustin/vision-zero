import React from "react";
import { StoreContext } from "../../utils/store";

import styled from "styled-components";
import { colors } from "../../constants/colors";
import { ButtonGroup, Button, Card, Label } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWalking,
  faBiking,
  faCar,
  faMotorcycle
} from "@fortawesome/free-solid-svg-icons";

const modeParameters = {
  pedestrian: {
    icon: faWalking,
    syntax: `pedestrian_fl = "Y"`,
    type: `where`,
    operator: `OR`
  },
  pedalcyclist: {
    icon: faBiking,
    syntax: `pedalcyclist_fl = "Y"`,
    type: `where`,
    operator: `OR`
  },
  motor: {
    icon: faCar,
    syntax: `motor_vehicle_fl = "Y"`,
    type: `where`,
    operator: `OR`
  },
  motorcycle: {
    icon: faMotorcycle,
    syntax: `motorcycle_fl = "Y"`,
    type: `where`,
    operator: `OR`
  }
};

const SideMapControl = () => {
  const StyledCard = styled.div`
    font-size: 1.2em;

    .card-title {
      font-weight: bold;
      color: ${colors.white};
    }

    .card-body {
      background-color: ${colors.white};
    }
  `;

  const {
    mapFilters: [filters, setFilters]
  } = React.useContext(StoreContext);

  const handleFilterClick = event => {
    // Set filter or remove if already set
    const filterName = event.currentTarget.id;

    if (isFilterSet(filterName)) {
      const filterToRemove = modeParameters[filterName];
      const updatedFiltersArray = filters.filter(
        setFilter => setFilter !== filterToRemove
      );
      setFilters(updatedFiltersArray);
    } else {
      const filter = modeParameters[filterName];
      const filtersArray = [...filters, filter];
      setFilters(filtersArray);
    }
  };

  const handleAllFiltersClick = () => {
    setFilters([]);
  };

  const isFilterSet = filterName => {
    const clickedFilter = modeParameters[filterName];
    return !!filters.find(setFilter => setFilter === clickedFilter);
  };

  return (
    <StyledCard>
      <div className="card-title">Traffic Crashes</div>
      <Card className="p-3 card-body">
        <Label for="mode-buttons" className="text-dark">
          Filters
        </Label>
        <ButtonGroup id="mode-buttons">
          {Object.entries(modeParameters).map(([k, v], i) => (
            <Button
              key={i}
              color="info"
              onClick={handleFilterClick}
              id={k}
              active={isFilterSet(k)}
              outline={!isFilterSet(k)}
            >
              <FontAwesomeIcon icon={v.icon} className="mr-1 ml-1" />
            </Button>
          ))}
          <Button
            color="info"
            onClick={handleAllFiltersClick}
            id="all"
            active={filters.length === 0}
            outline={filters.length !== 0}
          >
            All
          </Button>
        </ButtonGroup>
      </Card>
    </StyledCard>
  );
};

export default SideMapControl;

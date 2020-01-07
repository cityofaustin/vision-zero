import React from "react";
import { StoreContext } from "../../utils/store";

import { Container, ButtonGroup, Button, Card } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWalking,
  faBicycle,
  faCar,
  faMotorcycle
} from "@fortawesome/free-solid-svg-icons";

const modeParameters = {
  pedestrian: {
    icon: faWalking,
    syntax: `pedestrian_fl = "Y"`,
    type: `where`,
    operator: `AND`
  },
  pedalcyclist: {
    icon: faBicycle,
    syntax: `pedalcyclist_fl = "Y"`,
    type: `where`,
    operator: `AND`
  },
  motor: {
    icon: faCar,
    syntax: `motor_vehicle_fl = "Y"`,
    type: `where`,
    operator: `AND`
  },
  motorcycle: {
    icon: faMotorcycle,
    syntax: `motorcycle_fl = "Y"`,
    type: `where`,
    operator: `AND`
  }
};

const SideMapControl = () => {
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

  const isFilterSet = filterName => {
    const clickedFilter = modeParameters[filterName];
    return !!filters.find(setFilter => setFilter === clickedFilter);
  };

  return (
    <Container>
      <Card className="p-2 bg-light">
        <legend className="text-dark">Filters</legend>
        <ButtonGroup>
          {Object.entries(modeParameters).map(([k, v], i) => (
            <Button
              key={i}
              color="info"
              onClick={handleFilterClick}
              id={k}
              active={isFilterSet(k)}
            >
              <FontAwesomeIcon icon={v.icon} className="mr-1 ml-1" />
            </Button>
          ))}
        </ButtonGroup>
      </Card>
    </Container>
  );
};

export default SideMapControl;

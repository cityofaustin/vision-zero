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

const queryParameters = {
  pedestrian: {
    syntax: `pedestrian_fl = "Y"`,
    type: `where`,
    operator: `AND`
  },
  pedalcyclist: {
    syntax: `pedalcyclist_fl = "Y"`,
    type: `where`,
    operator: `AND`
  },
  motor: {
    syntax: `motor_vehicle_fl = "Y"`,
    type: `where`,
    operator: `AND`
  },
  motorcycle: {
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
      const filterToRemove = queryParameters[filterName];
      const updatedFiltersArray = filters.filter(
        setFilter => setFilter !== filterToRemove
      );
      setFilters(updatedFiltersArray);
    } else {
      const filter = queryParameters[filterName];
      const filtersArray = [...filters, filter];
      setFilters(filtersArray);
    }
  };

  const isFilterSet = filterName => {
    const clickedFilter = queryParameters[filterName];
    return !!filters.find(setFilter => setFilter === clickedFilter);
  };

  return (
    <Container>
      <Card className="p-3 bg-light">
        <legend className="text-dark">Filters</legend>
        <ButtonGroup>
          <Button
            color="info"
            onClick={handleFilterClick}
            id="pedestrian"
            active={isFilterSet("pedestrian")}
          >
            <FontAwesomeIcon icon={faWalking} className="mr-1 ml-1" />
          </Button>
          <Button
            color="info"
            onClick={handleFilterClick}
            id="pedalcyclist"
            active={isFilterSet("pedalcyclist")}
          >
            <FontAwesomeIcon icon={faBicycle} className="mr-1 ml-1" />
          </Button>
          <Button
            color="info"
            onClick={handleFilterClick}
            id="motor"
            active={isFilterSet("motor")}
          >
            <FontAwesomeIcon icon={faCar} className="mr-1 ml-1" />
          </Button>
          <Button
            color="info"
            onClick={handleFilterClick}
            id="motorcycle"
            active={isFilterSet("motorcycle")}
          >
            <FontAwesomeIcon icon={faMotorcycle} className="mr-1 ml-1" />
          </Button>
        </ButtonGroup>
      </Card>
    </Container>
  );
};

export default SideMapControl;

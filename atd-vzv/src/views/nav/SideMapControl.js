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

const StyledCard = styled.div`
  font-size: 1.2em;

  .card-title {
    font-weight: bold;
    color: ${colors.white};
  }

  .section-title {
    font-size: 1em;
    color: ${colors.dark};
  }

  .card-body {
    background-color: ${colors.white};
  }
`;

const SideMapControl = () => {
  const {
    mapFilters: [filters, setFilters]
  } = React.useContext(StoreContext);

  // Clear all filters that match group arg
  const handleAllFiltersClick = (event, group) => {
    const keepFilters = filters.filter(filter => filter.group !== group);
    setFilters(keepFilters);
  };

  // Determine if no filters in a group are applied (used for "All" buttons active/inactive state)
  const isUnfiltered = group => {
    const result = filters.filter(filter => filter.group === group);
    return result.length === 0;
  };

  // Define groups of map filters
  const mapFilters = {
    mode: {
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
      },
      all: {
        text: "All",
        handler: handleAllFiltersClick,
        active: isUnfiltered,
        inactive: isUnfiltered
      }
    },
    type: {
      seriousInjury: {
        text: `Injury`,
        syntax: `sus_serious_injry_cnt > 0`,
        type: `where`,
        operator: `AND`
      },
      fatal: {
        text: `Fatal`,
        syntax: `death_cnt > 0`,
        type: `where`,
        operator: `AND`
      }
    }
  };

  const handleFilterClick = (event, filterGroup) => {
    // Set filter or remove if already set
    const filterName = event.currentTarget.id;

    if (isFilterSet(filterName)) {
      const updatedFiltersArray = filters.filter(
        setFilter => setFilter.name !== filterName
      );
      setFilters(updatedFiltersArray);
    } else {
      const filter = mapFilters[filterGroup][filterName];
      // Add filterName and group to object for IDing and grouping
      filter["name"] = filterName;
      filter["group"] = filterGroup;
      const filtersArray = [...filters, filter];
      setFilters(filtersArray);
    }
  };

  const isFilterSet = filterName => {
    return !!filters.find(setFilter => setFilter.name === filterName);
  };

  return (
    <StyledCard>
      <div className="card-title">Traffic Crashes</div>
      <Card className="p-3 card-body">
        <Label className="section-title">Filters</Label>
        {/* Create a button group for each group of mapFilters */}
        {Object.entries(mapFilters).map(([group, groupParameters], i) => (
          <ButtonGroup key={i} className="mb-3 d-flex" id={`${group}-buttons`}>
            {/* Create buttons for each filter within a group of mapFilters */}
            {Object.entries(groupParameters).map(([name, parameter], i) => (
              <Button
                key={i}
                id={name}
                color="info"
                className="w-100 pt-1 pb-1 pl-0 pr-0"
                // Use alternate handler if defined
                onClick={
                  parameter.handler
                    ? event => parameter.handler(event, group)
                    : event => handleFilterClick(event, group)
                }
                // Use alternate active/inactive method if defined
                active={
                  parameter.active ? parameter.active(group) : isFilterSet(name)
                }
                outline={
                  parameter.inactive
                    ? !parameter.inactive(group)
                    : !isFilterSet(name)
                }
              >
                {parameter.icon && (
                  <FontAwesomeIcon
                    icon={parameter.icon}
                    className="mr-1 ml-1"
                  />
                )}
                {parameter.text}
              </Button>
            ))}
          </ButtonGroup>
        ))}
      </Card>
    </StyledCard>
  );
};

export default SideMapControl;

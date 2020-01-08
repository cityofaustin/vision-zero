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

// TODO: Preserve Fatal or Serious Injury selection when selecting "All" in mode group

const SideMapControl = () => {
  const StyledCard = styled.div`
    font-size: 1.2em;

    .card-title {
      font-weight: bold;
      color: ${colors.white};
    }

    .card-body {
      diplay: flex;
      align-items: center;
      background-color: ${colors.white};
    }
  `;

  const {
    mapFilters: [filters, setFilters]
  } = React.useContext(StoreContext);

  const handleAllFiltersClick = () => {
    setFilters([]);
  };

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
        active: filters.length === 0,
        inactive: filters.length !== 0
      }
    },
    type: {
      fatal: {
        text: `Fatal`,
        syntax: `death_cnt > 0`,
        type: `where`,
        operator: `AND`
      },
      seriousInjury: {
        text: `Serious Injury`,
        syntax: `sus_serious_injry_cnt > 0`,
        type: `where`,
        operator: `AND`
      }
    }
  };

  const handleFilterClick = (event, filterSection) => {
    // Set filter or remove if already set
    const filterName = event.currentTarget.id;

    if (isFilterSet(filterName)) {
      const updatedFiltersArray = filters.filter(
        setFilter => setFilter.name !== filterName
      );
      setFilters(updatedFiltersArray);
    } else {
      const filter = mapFilters[filterSection][filterName];
      // Add filterName to object to ID filter when removing
      filter["name"] = filterName;
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
        {/* Create a button group for each section of mapFilters */}
        {Object.entries(mapFilters).map(([section, sectionParameters], i) => (
          <ButtonGroup className="mb-3" id={`${section}-buttons`}>
            {/* Create buttons for each filter within a section of mapFilters */}
            {Object.entries(sectionParameters).map(([name, parameter], i) => (
              <Button
                key={i}
                color="info"
                // Use alternate handler if defined
                onClick={
                  parameter.handler
                    ? parameter.handler
                    : event => handleFilterClick(event, section)
                }
                id={name}
                // Use alternate active/inactive method if defined
                active={parameter.active ? parameter.active : isFilterSet(name)}
                outline={
                  parameter.inactive ? parameter.inactive : !isFilterSet(name)
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

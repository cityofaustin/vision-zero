import React from "react";
import { StoreContext } from "../../utils/store";
import InfoPopover from "../../Components/Popover/InfoPopover";
import { popoverConfig } from "../../Components/Popover/popoverConfig";

import { ButtonGroup, Button, Card, Label } from "reactstrap";

const SideMapControlOverlays = () => {
  const {
    mapOverlay: [overlay, setOverlay],
  } = React.useContext(StoreContext);

  // Set overlay title and optional options
  const overlays = {
    asmp: {
      title: "ASMP Street Levels",
      options: ["1", "2", "3", "4", "5"],
    },
    highInjury: {
      title: "High Injury Network",
    },
    cityCouncil: {
      title: "Austin City Council Districts",
    },
  };

  const handleOverlayClick = (event, parameters) => {
    // Set overlay in Context store or remove it
    const overlayName = event.currentTarget.id;

    if (overlay.name !== overlayName) {
      setOverlay({
        name: overlayName,
        options: parameters.options,
      });
    } else if (overlay.name === overlayName) {
      setOverlay("");
    }
  };

  const handleOverlayOptionClick = (event) => {
    // Set overlay in Context store or remove it
    const overlayOption = event.currentTarget.id;

    if (!overlay.options.includes(overlayOption)) {
      // Add clicked option to state
      setOverlay((prevState) => ({
        ...prevState,
        options: [...prevState.options, ...overlayOption],
      }));
    } else if (overlay.options.includes(overlayOption)) {
      // Remove clicked option from state
      setOverlay((prevState) => ({
        ...prevState,
        options: prevState.options.filter((option) => option !== overlayOption),
      }));
    }
  };

  return (
    <Card className="mt-3 p-3 card-body">
      <Label className="section-title">
        <h3 className="h5">
          Overlays <InfoPopover config={popoverConfig.map.overlays} />
        </h3>
      </Label>
      {/* Create a button group for each overlay */}
      {Object.entries(overlays).map(([name, parameters], i) => (
        <ButtonGroup vertical className="mb-3" key={i}>
          <Button
            key={i}
            id={name}
            color="dark"
            className="w-100 pt-1 pb-1 pl-0 pr-0"
            onClick={(event) => handleOverlayClick(event, parameters)}
            active={name === overlay.name}
            outline={name !== overlay.name}
          >
            {parameters.title}
          </Button>
          {/* If options set in config, render button group for each option */}
          {overlay.name === name && parameters.options && (
            <ButtonGroup>
              {parameters.options.map((option, i) => (
                <Button
                  key={i}
                  id={option}
                  color="dark"
                  className="w-100 pt-1 pb-1 pl-0 pr-0"
                  active={overlay.options.includes(option)}
                  outline={!overlay.options.includes(option)}
                  onClick={handleOverlayOptionClick}
                >
                  {option}
                </Button>
              ))}
            </ButtonGroup>
          )}
        </ButtonGroup>
      ))}
    </Card>
  );
};

export default SideMapControlOverlays;

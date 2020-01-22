import React from "react";
import { StoreContext } from "../../utils/store";

import { ButtonGroup, Button, Card, Label } from "reactstrap";

const SideMapControlOverlays = () => {
  const {
    mapOverlay: [overlay, setOverlay]
  } = React.useContext(StoreContext);

  const overlays = {
    asmp: {
      title: "ASMP Street Levels",
      options: ["1", "2", "3", "4", "5"]
    }
  };

  const handleOverlayClick = (event, parameters) => {
    // Set overlay in Context store or remove it
    const overlayName = event.currentTarget.id;

    if (overlay === "" || overlay.overlayName !== overlayName) {
      setOverlay({
        overlayName: overlayName,
        overlayOptions: parameters.options
      });
    } else if (overlay.overlayName === overlayName) {
      setOverlay("");
    }
  };

  const handleOverlayOptionClick = event => {
    // Set overlay in Context store or remove it
    const overlayOption = event.currentTarget.id;

    if (!overlay.overlayOptions.includes(overlayOption)) {
      // set overlay level
      const updatedOverlay = overlay;
      updatedOverlay.overlayOptions = [
        ...overlay.overlayOptions,
        ...overlayOption
      ];
      setOverlay(updatedOverlay);
    } else if (overlay.overlayOptions.includes(overlayOption)) {
      // remove overlay level
      const updatedOverlay = overlay;
      updatedOverlay.overlayOptions = overlay.overlayOptions.filter(
        option => option !== overlayOption
      );

      setOverlay(updatedOverlay);
    }
  };

  return (
    <Card className="mt-3 p-3 card-body">
      <Label className="section-title">Overlays</Label>
      {/* Create a button group for each overlay */}
      {Object.entries(overlays).map(([name, parameters], i) => (
        <Button
          key={i}
          id={name}
          color="info"
          className="w-100 pt-1 pb-1 pl-0 pr-0"
          onClick={event => handleOverlayClick(event, parameters)}
          active={name === overlay.overlayName}
          outline={name !== overlay.overlayName}
        >
          {parameters.title}
        </Button>
      ))}
      {overlay.overlayName === "asmp" && (
        <ButtonGroup>
          {overlays.asmp.options.map((level, i) => (
            <Button
              key={i}
              id={level}
              color="info"
              className="w-100 pt-1 pb-1 pl-0 pr-0"
              //   TODO: Fix active and outline logic
              active={overlay.overlayOptions.includes(level)}
              outline={!overlay.overlayOptions.includes(level)}
              onClick={handleOverlayOptionClick}
            >
              {level}
            </Button>
          ))}
        </ButtonGroup>
      )}
    </Card>
  );
};

export default SideMapControlOverlays;

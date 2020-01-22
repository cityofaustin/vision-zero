import React from "react";
import { StoreContext } from "../../utils/store";

import { Button, Card, Label } from "reactstrap";

const SideMapControlOverlays = () => {
  const {
    mapOverlay: [overlay, setOverlay]
  } = React.useContext(StoreContext);

  const overlays = {
    asmp: {
      title: "ASMP Street Levels"
    }
  };

  const handleOverlayClick = event => {
    // Set overlay in Context store or remove it
    const overlayName = event.currentTarget.id;

    if (overlay !== overlayName) {
      setOverlay(overlayName);
    } else if (overlay === overlayName) {
      setOverlay("");
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
          onClick={handleOverlayClick}
          active={name === overlay}
          outline={name !== overlay}
        >
          {parameters.title}
        </Button>
      ))}
    </Card>
  );
};

export default SideMapControlOverlays;

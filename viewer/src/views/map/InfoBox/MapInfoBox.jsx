import React from "react";
import { Popup } from "react-map-gl/mapbox";
import InfoCard from "./InfoCard";
import { format } from "date-fns";
import styled from "styled-components";
import { StyledMobileInfo, setPopupPosition } from "./infoBoxStyles";

const StyledPopup = styled.div`
  user-select: text;

  .mapboxgl-popup-close-button {
    font-size: 25px;
  }

  .mapboxgl-popup-content {
    ${(props) => setPopupPosition(props.$popupX)}
  }
`;

const MapInfoBox = React.memo(
  ({
    selectedFeature,
    setSelectedFeature,
    type, // id of feature layer
  }) => {
    const popupInfo = selectedFeature && selectedFeature.properties;
    const popupX = popupInfo.pixelCoordinates && popupInfo.pixelCoordinates.x;

    const buildSeriousInjuriesOrFatalitiesConfig = (info) => [
      {
        title: "Date/Time",
        content: format(new Date(info.crash_timestamp_ct), "MM/dd/yyyy h:mm a"),
      },
      { title: "Fatalities", content: info.death_cnt },
      { title: "Serious Injuries", content: info.sus_serious_injry_cnt },
      {
        title: "Modes Involved",
        content: info.units_involved.split(" &").join(", "),
      },
      { title: "Crash ID", content: info.cris_crash_id || `T${info.id}` },
    ];

    const cardConfig = {
      fatalities: buildSeriousInjuriesOrFatalitiesConfig,
      seriousInjuries: buildSeriousInjuriesOrFatalitiesConfig,
      cityCouncil: (info) => [
        {
          title: `City Council District ${info.COUNCIL_DISTRICT}`,
          content: "",
        },
      ],
    };

    const infoCard = <InfoCard content={cardConfig[type](popupInfo)} />;

    return (
      popupInfo && (
        <StyledPopup $popupX={popupX}>
          <Popup
            tipSize={10}
            anchor="top"
            longitude={parseFloat(popupInfo.longitude)}
            latitude={parseFloat(popupInfo.latitude)}
            onClose={() => setSelectedFeature(null)}
            closeOnClick={false}
            dynamicPosition={false} // Set popup position with StyledPopup
          >
            <StyledMobileInfo
              role="region"
              aria-live="polite"
              aria-label="Selected crash details"
            >
              {infoCard}
            </StyledMobileInfo>
          </Popup>
        </StyledPopup>
      )
    );
  }
);

export default MapInfoBox;

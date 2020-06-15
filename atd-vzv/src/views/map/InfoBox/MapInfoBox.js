import React from "react";
import { Popup } from "react-map-gl";
import InfoCard from "./InfoCard";
import moment from "moment";
import styled from "styled-components";
import {
  StyledDesktopInfo,
  StyledMobileInfo,
  maxInfoBoxWidth,
} from "./infoBoxStyles";

const MapInfoBox = ({
  selectedFeature,
  setSelectedFeature,
  isMobile,
  type, // id of feature layer
}) => {
  const popupInfo = selectedFeature && selectedFeature.properties;
  const popupX = popupInfo.pixelCoordinates && popupInfo.pixelCoordinates.x;

  // 1. If the max width of the popups fit within view on both sides, do that
  // 2. If it would extend beyond left side of view, set left position
  // 3. If it would extend beyond right side of view, set right position
  const StyledPopup = styled.div`
    .mapboxgl-popup-content {
      /* Calc left offset based on coords */
      ${
        popupX &&
        popupX + maxInfoBoxWidth / 2 < window.innerWidth &&
        popupX - maxInfoBoxWidth / 2 > 0 &&
        `left: ${popupX - maxInfoBoxWidth / 2};`
      }

      ${
        popupX &&
        popupX - maxInfoBoxWidth / 2 <= 0 &&
        `left: ${maxInfoBoxWidth / 2 - popupX}px;`
      }

      ${
        popupX &&
        popupX + maxInfoBoxWidth / 2 >= window.innerWidth &&
        `right: ${popupX + maxInfoBoxWidth / 2 - window.innerWidth}px;`
      }
    }
  `;

  const buildSeriousInjuriesOrFatalitiesConfig = (info) => [
    {
      title: "Date/Time",
      content: moment(info.crash_date).format("MM/DD/YYYY HH:MM A"),
    },
    { title: "Fatalities", content: info.death_cnt },
    { title: "Serious Injuries", content: info.sus_serious_injry_cnt },
    {
      title: "Modes Involved",
      content: info.units_involved.split(" &").join(", "),
    },
    { title: "Crash ID", content: info.crash_id },
  ];

  const cardConfig = {
    fatalities: buildSeriousInjuriesOrFatalitiesConfig,
    seriousInjuries: buildSeriousInjuriesOrFatalitiesConfig,
    cityCouncil: (info) => [
      {
        title: `City Council District ${info.council_district}`,
        content: "",
      },
    ],
  };

  const infoCard = <InfoCard content={cardConfig[type](popupInfo)} />;

  return (
    popupInfo &&
    (isMobile ? (
      <StyledPopup>
        <Popup
          tipSize={10}
          anchor="top"
          longitude={parseFloat(popupInfo.longitude)}
          latitude={parseFloat(popupInfo.latitude)}
          onClose={() => setSelectedFeature(null)}
          dynamicPosition={false} // Set popup position with StyledPopup
        >
          <StyledMobileInfo>{infoCard}</StyledMobileInfo>
        </Popup>
      </StyledPopup>
    ) : (
      <StyledDesktopInfo>{infoCard}</StyledDesktopInfo>
    ))
  );
};

export default MapInfoBox;

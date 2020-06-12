import React from "react";
import { Popup } from "react-map-gl";
import styled from "styled-components";
import InfoCard from "./InfoCard";
import { responsive } from "../../constants/responsive";
import moment from "moment";

const MapInfoBox = ({
  selectedFeature,
  setSelectedFeature,
  isMobile,
  type, // id of feature layer
}) => {
  console.log(selectedFeature);
  const maxInfoBoxWidth = responsive.drawerWidth - 20;

  const StyledDesktopInfo = styled.div`
    position: absolute;
    margin: 8px;
    padding: 2px;
    max-width: ${maxInfoBoxWidth}px;
    z-index: 9 !important;
    pointer-events: none;
  `;

  const StyledMobileInfo = styled.div`
    .card {
      background: none;
      border: none;
      max-width: ${maxInfoBoxWidth}px;
    }
  `;

  const StyledPopup = styled.div`
    .mapboxgl-popup-content {
      /* Calc left offset based on coords */
      left: ${selectedFeature.properties.pixelCoordinate
        ? -selectedFeature.properties.pixelCoordinate.x +
          +maxInfoBoxWidth / 2 +
          20
        : 0}px;
    }
  `;

  const popupInfo = selectedFeature && selectedFeature.properties;

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
          dynamicPosition={false}
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

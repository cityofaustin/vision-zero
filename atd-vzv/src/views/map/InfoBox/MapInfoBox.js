import React from "react";
import { Popup } from "react-map-gl";
import InfoCard from "./InfoCard";
import moment from "moment";
import { StyledDesktopInfo, StyledMobileInfo } from "./infoBoxStyles";

const MapInfoBox = ({
  selectedFeature,
  setSelectedFeature,
  isMobile,
  type, // id of feature layer
}) => {
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
      <Popup
        tipSize={10}
        anchor="top"
        longitude={parseFloat(popupInfo.longitude)}
        latitude={parseFloat(popupInfo.latitude)}
        onClose={() => setSelectedFeature(null)}
      >
        <StyledMobileInfo>{infoCard}</StyledMobileInfo>
      </Popup>
    ) : (
      <StyledDesktopInfo>{infoCard}</StyledDesktopInfo>
    ))
  );
};

export default MapInfoBox;

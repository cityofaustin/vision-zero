import React, { useMemo } from "react";
import InfoCard from "./InfoCard";
import { StyledPoylgonInfo } from "./infoBoxStyles";

const MapPolygonInfoBox = ({ crashCounts, isMapTypeSet }) => {
  const content = useMemo(() => {
    const contentDraft = [];
    if (isMapTypeSet.fatal) {
      contentDraft.push({
        title: "Fatalities",
        content: `${crashCounts?.fatality || 0}`,
      });
    }

    if (isMapTypeSet.injury) {
      contentDraft.push({
        title: "Serious Injuries",
        content: `${crashCounts?.injury || 0}`,
      });
    }
    return contentDraft;
  }, [crashCounts, isMapTypeSet]);

  return (
    <StyledPoylgonInfo>
      <InfoCard content={content} />
    </StyledPoylgonInfo>
  );
};

export default MapPolygonInfoBox;

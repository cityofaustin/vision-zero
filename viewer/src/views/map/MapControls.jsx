import React from "react";
import styled from "styled-components";
import { GeolocateControl, NavigationControl } from "react-map-gl/mapbox";

const StyledMapNav = styled.div`
  .nav-buttons {
    position: absolute;
    top: 0px;
    right: 30px;
    padding: 10px;
  }

  .geolocate-button {
    position: absolute;
    top: 68px;
    right: 30px;
    padding: 10px;
  }
`;

const MapControls = () => {
  
  return (
    <StyledMapNav>
      <div className="nav-buttons">
        <NavigationControl showCompass={false} />
      </div>
      <div className="geolocate-button">
        <GeolocateControl />
      </div>
    </StyledMapNav>
  );
};

export default MapControls;

import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompass, faCircle } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../constants/colors";

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const StyledMapSpinner = styled.div`
  position: absolute;
  width: 0px;
  top: 50%;
  /* Adjust centering with half FA spinner width */
  left: calc(50% - 28px);
  transform: translate(-50%, -50%);

  .needle {
    animation-name: wiggle;
    animation-duration: 2500ms;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
  }

  @keyframes wiggle {
    0% {
      transform: rotate(0deg);
    }
    10% {
      transform: rotate(12deg);
    }
    40% {
      transform: rotate(-25deg);
    }
    60% {
      transform: rotate(20deg);
    }
    80% {
      transform: rotate(-15deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
`;

const MapCompassSpinner = ({ isSpinning }) => {
  return (
    isSpinning && (
      <StyledMapSpinner
        className="fa-layers fa-fw"
        role="status"
        aria-live="polite"
      >
        <VisuallyHidden>Loading map data</VisuallyHidden>
        <FontAwesomeIcon icon={faCircle} color={colors.infoDark} size="4x" />
        <FontAwesomeIcon
          className="needle"
          icon={faCompass}
          color={colors.dark}
          size="4x"
        />
      </StyledMapSpinner>
    )
  );
};

export default MapCompassSpinner;

import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompass, faCircle } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../../constants/colors";

const MapCompassSpinner = ({ isSpinning }) => {
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

  return (
    isSpinning && (
      <StyledMapSpinner className="fa-layers fa-fw">
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

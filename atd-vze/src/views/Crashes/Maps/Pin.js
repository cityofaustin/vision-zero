import React, { PureComponent } from "react";
import styled, { keyframes, css } from "styled-components";
import { colors } from "../../../styles/colors";
import { pinStyles, PIN_ICON } from "../../../styles/mapPinStyles";
export default class Pin extends PureComponent {
  render() {
    const {
      color = "warning",
      size = 40,
      isDragging,
      animated = false,
    } = this.props;

    const pinStyle = {
      fill: colors[color],
      stroke: pinStyles["stroke"],
      strokeWidth: pinStyles["strokeWidth"],
      // Move pin up on drag and down when dropped
      transform: `translate(${-size / 2}px, ${
        isDragging && animated ? `-65px` : `${-size}px`
      })`,
    };

    const pulsate = keyframes`
      0% {
        transform: scale(0.1, 0.1);
        opacity: 0;
      }
      50% {
        opacity: 1;
      }
      100% {
        transform: scale(1.2, 1.2);
        opacity: 0;
      }
    `;

    const pulseMixin = css`
      &:after {
        content: "";
        border-radius: 50%;
        height: 40px;
        width: 40px;
        position: absolute;
        margin: -13px 0 0 -15px;
        animation: ${pulsate} 1.2s ease-out;
        animation-iteration-count: infinite;
        box-shadow: 0 0 2px 2px ${colors[color]};
      }
    `;

    const Shadow = styled.div`
      background: ${colors[color]};
      border-radius: 50%;
      height: 10px;
      width: 10px;
      position: absolute;
      left: 72%;
      top: -10%;
      margin: 11px 0px 0px -12px;
      transform: rotateX(55deg) translate(${-size / 2}px, ${-size}px);
      z-index: -2;

      /* Disable pulse animation while dragging map */
      ${!isDragging && animated && pulseMixin}
    `;

    return (
      <>
        <svg height={size} viewBox="0 0 100 125" style={pinStyle}>
          <path d={PIN_ICON} />
        </svg>
        <Shadow color={color} />
      </>
    );
  }
}

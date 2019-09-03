import React, { PureComponent } from "react";
import styled from "styled-components";
import { colors } from "../../styles/colors";
import { pinStyles } from "../../styles/mapPinStyles";
export default class Pin extends PureComponent {
  render() {
    const color = this.props.color;
    const size = this.props.size;

    const pinStyle = {
      fill: colors[color],
      stroke: pinStyles["stroke"],
      strokeWidth: pinStyles["strokeWidth"],
    };

    const Shadow = styled.div`
      background: ${colors[color]};
      border-radius: 50%;
      height: 10px;
      width: 10px;
      position: absolute;
      left: 74%;
      top: 34%;
      margin: 11px 0px 0px -12px;
      transform: rotateX(55deg);
      z-index: -2;
    `;

    const ICON = `M50,93.5c0,0,31.1-30.5,31.1-56C81.1,20.4,67.2,6.5,50,6.5c-17.2,0-31.1,13.9-31.1,31.1C18.9,63.1,50,93.5,50,93.5z   M35.2,37.6c0-8.2,6.6-14.8,14.8-14.8c8.2,0,14.8,6.6,14.8,14.8c0,8.2-6.6,14.8-14.8,14.8C41.8,52.4,35.2,45.8,35.2,37.6z`;

    return (
      <>
        <svg height={size} viewBox="0 0 100 125" style={pinStyle}>
          <path d={ICON} />
        </svg>
        <Shadow />
      </>
    );
  }
}

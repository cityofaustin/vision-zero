import styled from "styled-components";
import { responsive } from "../../../constants/responsive";

export const popupMargin = 20;
export const maxInfoBoxWidth = responsive.drawerWidth - popupMargin;

export const StyledDesktopInfo = styled.div`
  position: absolute;
  margin: 8px;
  padding: 2px;
  max-width: ${maxInfoBoxWidth}px;
  z-index: 9 !important;
  pointer-events: none;
`;

export const StyledMobileInfo = styled.div`
  .card {
    background: none;
    border: none;
    max-width: ${maxInfoBoxWidth}px;
  }
`;

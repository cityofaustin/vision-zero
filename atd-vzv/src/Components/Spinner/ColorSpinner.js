import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

const ColorSpinner = ({ color, size }) => (
  <FontAwesomeIcon icon={faCircleNotch} color={color} size={size} spin />
);

export default ColorSpinner;

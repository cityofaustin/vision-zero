import {
  FaShieldHeart,
  FaGaugeHigh,
  FaLocationDot,
  FaUserGroup,
  FaCloudArrowUp,
  FaHeart,
} from "react-icons/fa6";
import { IconType } from "react-icons";
import { FaAmbulance } from "react-icons/fa";

interface Route {
  path: string;
  label: string;
  icon: IconType;
  allowedRoles?: string[];
}

export const routes: Route[] = [
  {
    path: "dashboard",
    label: "Dashboard",
    icon: FaGaugeHigh,
  },
  {
    path: "crashes",
    label: "Crashes",
    icon: FaShieldHeart,
  },
  {
    path: "fatalities",
    label: "Fatalities",
    icon: FaHeart,
  },
  {
    path: "locations",
    label: "Locations",
    icon: FaLocationDot,
  },
  {
    path: "ems",
    label: "EMS",
    icon: FaAmbulance,
  },
  {
    path: "upload-non-cr3",
    label: "Upload Non-CR3",
    icon: FaCloudArrowUp,
    allowedRoles: ["editor", "vz-admin"],
  },
  {
    path: "users",
    label: "Users",
    icon: FaUserGroup,
  },
];

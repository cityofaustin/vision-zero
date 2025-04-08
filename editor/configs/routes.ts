import {
  FaGaugeHigh,
  FaLocationDot,
  FaUserGroup,
  FaCloudArrowUp,
  FaHeart,
  FaCarBurst,
  FaTruckMedical,
} from "react-icons/fa6";
import { IconType } from "react-icons";

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
    icon: FaCarBurst,
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
    icon: FaTruckMedical,
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

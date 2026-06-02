import { FaRegHeart, FaCarBurst } from "react-icons/fa6";
import { RiDashboard3Line } from "react-icons/ri";
import { LuMapPin, LuAmbulance, LuCloudUpload, LuUsers } from "react-icons/lu";
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
    icon: RiDashboard3Line,
  },
  {
    path: "crashes",
    label: "Crashes",
    icon: FaCarBurst,
  },
  {
    path: "fatalities",
    label: "Fatalities",
    icon: FaRegHeart,
  },
  {
    path: "locations",
    label: "Locations",
    icon: LuMapPin,
  },
  {
    path: "ems",
    label: "EMS",
    icon: LuAmbulance,
  },
  {
    path: "upload-non-cr3",
    label: "Upload Non-CR3",
    icon: LuCloudUpload,
    allowedRoles: ["editor", "vz-admin"],
  },
  {
    path: "users",
    label: "Users",
    icon: LuUsers,
  },
];

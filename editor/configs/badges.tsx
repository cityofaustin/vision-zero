"use client";
import { LuAmbulance, LuFlame, LuClipboardPen } from "react-icons/lu";
import { RiPoliceBadgeLine } from "react-icons/ri";

export const BADGES = {
  apd: {
    icon: RiPoliceBadgeLine,
    backgroundColor: "#2c7bb6",
    color: "white",
  },
  ems: {
    icon: LuAmbulance,
    backgroundColor: "#d7191c",
    color: "white",
  },
  afd: {
    icon: LuFlame,
    backgroundColor: "#fdae61",
    color: "white",
  },
  crash_report: {
    icon: LuClipboardPen,
    backgroundColor: "#abd9e9",
    color: "black",
  },
};


"use client";
import {
  LuAmbulance,
  LuFlame,
  LuClipboardPen,
} from "react-icons/lu";
import { RiPoliceBadgeLine } from "react-icons/ri";
import { IconType } from "react-icons";

import AlignedLabel from "@/components/AlignedLabel";

export const RECORD_TYPE_BADGES: Record<string, RecordTypeBadgeProps> = {
  cad_apd: {
    icon: RiPoliceBadgeLine,
    colorClass: "primary",
    label: "APD",
  },
  cad_ems: {
    icon: LuAmbulance,
    colorClass: "danger",
    label: "EMS",
  },
  cad_afd: {
    icon: LuFlame,
    colorClass: "danger",
    label: "AFD",
  },
  crashes: {
    icon: LuClipboardPen,
    colorClass: "secondary",
    label: "Crash report",
  },
};

interface RecordTypeBadgeProps {
  icon: IconType;
  label: string;
  colorClass: "primary" | "danger" | "secondary";
  count?: number;
}


export function RecordTypeBadge({
  icon: Icon,
  label,
  colorClass,
}: RecordTypeBadgeProps) {
  return (
    <div className="d-flex">
      <AlignedLabel>
        <Icon className={`text-${colorClass} fs-4 me-2`} />
        <span className="fw-light fs-6 text-dark me-2 my-auto">{label}</span>
      </AlignedLabel>
    </div>
  );
}

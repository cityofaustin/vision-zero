"use client";
import { LuAmbulance, LuFlame, LuClipboardPen } from "react-icons/lu";
import { RiPoliceBadgeLine } from "react-icons/ri";
import { IconType } from "react-icons";
import { COLORS } from "@/utils/constants";

import AlignedLabel from "@/components/AlignedLabel";

interface RecordTypeBadgeProps {
  icon: IconType;
  label: string;
  iconStyle: React.CSSProperties;
  count?: number;
}

export const RECORD_TYPE_BADGES: Record<string, RecordTypeBadgeProps> = {
  apd: {
    icon: RiPoliceBadgeLine,
    iconStyle: { color: COLORS.primary },
    label: "APD",
  },
  ems: {
    icon: LuAmbulance,
    iconStyle: { color: COLORS.danger },
    label: "EMS",
  },
  afd: {
    icon: LuFlame,
    iconStyle: { color: COLORS.afd_orange },
    label: "AFD",
  },
  crashes: {
    icon: LuClipboardPen,
    iconStyle: { color: COLORS.secondary },
    label: "Crash report",
  },
};

export function RecordTypeBadge({
  icon: Icon,
  label,
  iconStyle,
}: RecordTypeBadgeProps) {
  return (
    <div className="d-flex">
      <AlignedLabel>
        <Icon className={`fs-4 me-2`} style={iconStyle && { ...iconStyle }} />
        <span className="fw-light fs-6 text-dark me-2 my-auto">{label}</span>
      </AlignedLabel>
    </div>
  );
}

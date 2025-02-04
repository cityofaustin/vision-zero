import { ReactNode } from "react";

/**
 * Component that renders vertically-aligned children and prevents
 * text wrapping. Use this to label a button with an icon and text.
 */
export default function AlignedLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-nowrap d-flex align-items-center">{children}</span>
  );
}

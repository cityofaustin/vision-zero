"use client";

export default function ShortcutHelperText({
  shortcutKey,
}: {
  shortcutKey: string;
}) {
  return (
    <div
      className="show-on-hover text-secondary fw-light mb-1"
      style={{ fontSize: ".9rem" }}
    >
      <span className="font-monospace rounded border px-1 bg-light">shift</span>{" "}
      +{" "}
      <span className="font-monospace rounded border px-1 bg-light">
        {shortcutKey.toLowerCase()}
      </span>{" "}
      to scroll here
    </div>
  );
}

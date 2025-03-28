/**
 * Function returns a className based on inury severity
 */
export const getInjuryColorClass = (
  injurySeverity: string
): "bg-danger-subtle" | "bg-warning-subtle" | "" => {
  switch (injurySeverity) {
    case "SUSPECTED SERIOUS INJURY":
      return "bg-warning-subtle";
    case "FATAL INJURY":
      return "bg-danger-subtle";
    default:
      return "";
  }
};

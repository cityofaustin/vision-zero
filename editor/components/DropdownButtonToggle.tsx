import { forwardRef, HTMLProps } from "react";
import { Button } from "react-bootstrap";

type CustomToggleProps = HTMLProps<HTMLButtonElement>;

/**
 * Custom button element dropdown toggle
 */
const DropdownButtonToggle = forwardRef<
  HTMLButtonElement,
  CustomToggleProps
>(({ children, onClick }, ref) => (
    <Button
      size="sm"
      ref={ref}
      onClick={onClick}
    >
      {children}
    </Button>
));

DropdownButtonToggle.displayName = "DropdownAnchorToggleButton";
export default DropdownButtonToggle;

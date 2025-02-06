import { forwardRef, HTMLProps } from "react";

type CustomToggleProps = HTMLProps<HTMLAnchorElement>;

/**
 * Custom anchor element dropdown toggle
 */
const DropdownAnchorToggle = forwardRef<HTMLAnchorElement, CustomToggleProps>(
  ({ children, onClick }, ref) => (
    <a
      href=""
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick(e);
      }}
    >
      {children}
    </a>
  )
);

DropdownAnchorToggle.displayName = "DropdownAnchorToggle";
export default DropdownAnchorToggle;

import Form from "react-bootstrap/Form";
import Dropdown from "react-bootstrap/Dropdown";
import { FaMoon } from "react-icons/fa6";
import { useTheme } from "@/contexts/AppThemeProvider";

export const darkModeLocalStorageKey = "userDarkModeSetting";

/**
 * Dropdown item with a switch that enables dark mode
 */
export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Dropdown.Item
      className="d-flex align-items-center"
      onClick={(e) => {
        setTheme(theme === "dark" ? "light" : "dark");
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <FaMoon className="me-3" />
      <span className="me-3">Dark mode</span>
      <Form.Check
        style={{ pointerEvents: "none" }}
        type="switch"
        label=""
        checked={theme === "dark"}
        className="my-auto"
        readOnly
      />
    </Dropdown.Item>
  );
}

import { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Dropdown from "react-bootstrap/Dropdown";
import { FaMoon } from "react-icons/fa6";

export const darkModeLocalStorageKey = "userDarkModeSetting";

/**
 * Dropdown item with a switch that enables dark mode
 */
export default function DarkModeToggle() {
  const [appColorMode, setAppColorMode] = useState<"dark" | "light">(
    localStorage.getItem(darkModeLocalStorageKey) === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute("data-bs-theme", appColorMode);
    localStorage.setItem(darkModeLocalStorageKey, appColorMode);
  }, [appColorMode]);

  return (
    <Dropdown.Item
      className="d-flex align-items-center"
      onClick={(e) => {
        setAppColorMode(appColorMode === "dark" ? "light" : "dark");
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
        checked={appColorMode === "dark"}
        className="my-auto"
        readOnly
      />
    </Dropdown.Item>
  );
}

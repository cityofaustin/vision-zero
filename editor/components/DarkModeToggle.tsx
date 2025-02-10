import { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Dropdown from "react-bootstrap/Dropdown";
import { FaMoon } from "react-icons/fa6";

export const darkModelocalStorageKey = "userDarkModeSetting";

/**
 * Dropdown item with a switch that enables dark mode
 */
export default function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem(darkModelocalStorageKey) === "true"
  );

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.setAttribute("data-bs-theme", "dark");
    } else {
      htmlElement.removeAttribute("data-bs-theme");
    }
    localStorage.setItem(darkModelocalStorageKey, String(isDarkMode));
  }, [isDarkMode]);

  return (
    <Dropdown.Item
      className="d-flex align-items-center"
      onClick={(e) => {
        setIsDarkMode(!isDarkMode);
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
        checked={isDarkMode}
        className="my-auto"
      />
    </Dropdown.Item>
  );
}

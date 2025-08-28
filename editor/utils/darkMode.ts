import { useEffect, useState } from "react";
import { darkModeLocalStorageKey } from "@/components/DarkModeToggle";

/**
 * Custom hook that returns whether the app is in dark mode
 * and uses event listener to listen for updates
 */
export const useCheckDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem(darkModeLocalStorageKey) === "dark"
  );

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(localStorage.getItem(darkModeLocalStorageKey) === "dark");
    };

    // Listens for the custom event added in DarkModeToggle.tsx
    window.addEventListener("themeChange", handleThemeChange);

    return () => {
      window.removeEventListener("themeChange", handleThemeChange);
    };
  }, []);

  return isDarkMode;
};

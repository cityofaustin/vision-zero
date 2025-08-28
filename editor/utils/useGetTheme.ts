import { useEffect, useState } from "react";
import { darkModeLocalStorageKey } from "@/components/DarkModeToggle";

/**
 * Custom hook that returns whether the app is in dark mode
 */
export const useGetTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem(darkModeLocalStorageKey) === "dark"
  );

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(localStorage.getItem(darkModeLocalStorageKey) === "dark");
    };

    window.addEventListener("themeChange", handleThemeChange);

    return () => {
      window.removeEventListener("themeChange", handleThemeChange);
    };
  }, []);

  return isDarkMode;
};

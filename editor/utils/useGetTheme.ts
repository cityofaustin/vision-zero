import { useEffect, useState } from "react";
import { darkModeLocalStorageKey } from "@/components/DarkModeToggle";

// hooks/useTheme.ts
export const useGetTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem(darkModeLocalStorageKey) === "dark"
  );
  console.log(isDarkMode, "is dark mode");

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(localStorage.getItem(darkModeLocalStorageKey) === "dark");
    };

    const handleThemeChange = () => {
      checkDarkMode();
    };

    // window.addEventListener("storage", handleStorageChange);
    window.addEventListener("themeChange", handleThemeChange);

    return () => {
      // window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("themeChange", handleThemeChange);
    };
  }, []);

  return isDarkMode;
};

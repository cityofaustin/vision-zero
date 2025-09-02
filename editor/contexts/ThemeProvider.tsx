"use client";
import { useEffect, useState, createContext, useContext } from "react";
import { darkModeLocalStorageKey } from "@/components/DarkModeToggle";

export const ThemeContext = createContext<string | null>(null);

/**
 * Global context provider that returns whether the app is in dark or light mode
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeMode, setThemeMode] = useState(
    localStorage.getItem(darkModeLocalStorageKey)
  );

  // Handles theme changes from anywhere in the app using event listener
  useEffect(() => {
    const handleThemeChange = () => {
      setThemeMode(localStorage.getItem(darkModeLocalStorageKey));
    };

    // Listens for the custom event added in DarkModeToggle.tsx
    window.addEventListener("themeChange", handleThemeChange);

    return () => {
      window.removeEventListener("themeChange", handleThemeChange);
    };
  }, []);

  return (
    <ThemeContext.Provider value={themeMode}>{children}</ThemeContext.Provider>
  );
};

/** Use global context to get the app theme */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  return context;
};

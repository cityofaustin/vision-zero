"use client";
import { useEffect, useState, createContext, useContext, useMemo } from "react";
import { darkModeLocalStorageKey } from "@/components/DarkModeToggle";

interface ThemeContextType {
  theme: "dark" | "light";
  setTheme: (mode: "dark" | "light") => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

/**
 * Global context provider that returns whether the app is in dark or light mode
 * and also returns an app theme state setter
 */
export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize with a default value, then update on client-side
  const [theme, setTheme] = useState<"dark" | "light">("light");

  // Only run on client-side
  useEffect(() => {
    // Get initial theme from localStorage if available
    const storedTheme = localStorage.getItem(darkModeLocalStorageKey);
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
    }
  }, []);

  // Sets theme in local storage and handles DOM updates when app theme state is updated
  useEffect(() => {
    // Make sure to only run this on client-side
    if (typeof window === "undefined") return;

    // This will only run in the browser
    const htmlElement = document.documentElement;
    htmlElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem(darkModeLocalStorageKey, theme);
  }, [theme]);

  // Use useMemo to prevent unnecessary re-renders on components that are reading these values unless theme has changed
  const contextValues = useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme, setTheme]
  );

  return (
    <ThemeContext.Provider value={contextValues}>
      {children}
    </ThemeContext.Provider>
  );
};

/** Use global context to get the app theme and app theme state setter */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within an AppThemeProvider");
  }
  return context;
};

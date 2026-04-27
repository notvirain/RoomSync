import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("roomsync_theme") || "light");
  const [accent, setAccentState] = useState(localStorage.getItem("roomsync_accent") || "default");

  useEffect(() => {
    document.body.dataset.theme = theme;
    document.body.dataset.accent = accent;
    localStorage.setItem("roomsync_theme", theme);
    localStorage.setItem("roomsync_accent", accent);
  }, [theme, accent]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setAccent = (preset) => {
    setAccentState(preset || "default");
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      accent,
      setAccent,
    }),
    [theme, accent]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
};

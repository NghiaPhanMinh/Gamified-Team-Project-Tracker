import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "maylamdi-theme";

function readInitialTheme(): Theme {
  if (typeof document !== "undefined") {
    const current = document.documentElement.dataset.theme;
    if (current === "light" || current === "dark") {
      return current;
    }
  }

  return "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);

    const themeMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    themeMeta?.setAttribute(
      "content",
      theme === "dark" ? "#121f25" : "#fffded",
    );
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggleTheme };
}

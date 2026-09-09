import { useEffect, useRef, useState } from "react";
const key = "mark-1-theme";
function savedPreference() {
  try {
    const value = localStorage.getItem(key);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}
export function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || "light",
  );
  const preference = useRef(savedPreference());
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#151916" : "#f5f4ef");
  }, [theme]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystem = () => {
      if (!preference.current) setTheme(media.matches ? "dark" : "light");
    };
    const syncStorage = (event) => {
      if (event.key !== key && event.key !== null) return;
      preference.current = savedPreference();
      setTheme(preference.current || (media.matches ? "dark" : "light"));
    };
    media.addEventListener("change", syncSystem);
    window.addEventListener("storage", syncStorage);
    return () => {
      media.removeEventListener("change", syncSystem);
      window.removeEventListener("storage", syncStorage);
    };
  }, []);
  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    preference.current = next;
    try {
      localStorage.setItem(key, next);
    } catch {
      /* Theme still works for this visit. */
    }
    setTheme(next);
  }
  return { theme, toggleTheme };
}

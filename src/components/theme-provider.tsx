"use client";

import * as React from "react";

const STORAGE_KEY = "invoice-theme";

export type ThemeSetting = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: ThemeSetting;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeSetting) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function systemPreference(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveSetting(setting: ThemeSetting): "light" | "dark" {
  return setting === "system" ? systemPreference() : setting;
}

function paint(setting: ThemeSetting) {
  const resolved = resolveSetting(setting);
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<ThemeSetting>("system");
  const [mounted, setMounted] = React.useState(false);

  React.useLayoutEffect(() => {
    let stored: ThemeSetting = "system";
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "light" || raw === "dark" || raw === "system") {
        stored = raw;
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydrate from localStorage
    setThemeState(stored);
    paint(stored);
    setMounted(true);
  }, []);

  React.useLayoutEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
    paint(theme);
  }, [mounted, theme]);

  React.useEffect(() => {
    if (!mounted || theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => paint("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mounted, theme]);

  const resolvedTheme = mounted ? resolveSetting(theme) : "light";

  const setTheme = React.useCallback((next: ThemeSetting) => {
    setThemeState(next);
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Same ergonomics as `next-themes` without injecting a `<script>` (React 19-safe).
 */
export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  const systemTheme =
    typeof window !== "undefined" ? systemPreference() : undefined;

  return {
    theme: ctx.theme,
    resolvedTheme: ctx.resolvedTheme,
    /** Accepts strings for compatibility with previous `next-themes` callers */
    setTheme: (next: string | ThemeSetting) => {
      if (next === "light" || next === "dark" || next === "system") {
        ctx.setTheme(next);
      }
    },
    themes: ["light", "dark", "system"],
    systemTheme,
  };
}

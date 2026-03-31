"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Icon } from "./Icon";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="tradew-theme-toggle"
        aria-label="Toggle theme"
        disabled
        style={{ opacity: 0.5 }}
      >
        <Icon action="theme-toggle" size="md" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      className="tradew-theme-toggle"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Icon action={isDark ? "moon" : "sun"} size="md" />
    </button>
  );
}


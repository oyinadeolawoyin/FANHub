import React from 'react';

// Square Logo Component - Black & Blue Theme
export function SquareLogo({ theme = "light", size = 20 }) {
  const isDark = theme === "dark";

  // Filters for eagle emoji: keeps it readable in dark/light mode
  const blueEagleFilter = "brightness(0) saturate(100%) invert(36%) sepia(89%) saturate(2450%) hue-rotate(198deg) brightness(95%) contrast(95%)";

  return (
    <div
      role="img"
      aria-label="The Voices logo"
      className="flex flex-col items-center justify-center rounded-xl shadow-md transition-all duration-500"
      style={{
        width: `${size * 4}px`,
        height: `${size * 4}px`,
        borderRadius: "10px",
        backgroundColor: isDark ? "#0f1a2d" : "#ffffff", // dark navy or white
        color: isDark ? "#3b82f6" : "#2563eb",           // theme blue text
        border: `1px solid ${isDark ? "#1e2a44" : "#e2e8f0"}`,
        boxShadow: isDark 
          ? "0 0px 5px rgba(59, 130, 246, 0.25)" 
          : "0 0px 5px rgba(37, 99, 235, 0.15)",
      }}
    >
      <span
        className="leading-none select-none"
        style={{
          fontSize: `${size / 1.33}px`,
          filter: isDark ? blueEagleFilter : blueEagleFilter,
          transition: "filter 0.5s ease, transform 0.25s ease",
        }}
      >
        🦅
      </span>

      <p
        className="mt-1 text-xs font-semibold tracking-wide transition-colors duration-500"
        style={{
          color: isDark ? "#3b82f6" : "#2563eb", // match text color to theme
        }}
        aria-hidden="true"
      >
        The Voices
      </p>
    </div>
  );
}
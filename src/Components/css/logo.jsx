import React from "react";

// Square Logo Component - Black & Blue Theme
export function SquareLogo({ theme = "light", size = 10 }) {
  const isDark = theme === "dark";

  // Filters for eagle: keeps it readable in dark/light mode
  const blueEagleFilter =
    "brightness(0) saturate(100%) invert(36%) sepia(89%) saturate(2450%) hue-rotate(198deg) brightness(95%) contrast(95%)";

  const squareSize = size * 4;

  return (
    <svg
      role="img"
      aria-label="The Voices logo"
      width={squareSize}
      height={squareSize}
      viewBox={`0 0 ${squareSize} ${squareSize}`}
      style={{
        borderRadius: "10px",
        backgroundColor: isDark ? "#0f1a2d" : "#ffffff",
        boxShadow: isDark
          ? "0 0px 5px rgba(59, 130, 246, 0.25)"
          : "0 0px 5px rgba(37, 99, 235, 0.15)",
      }}
    >
      {/* Background square */}
      <rect
        width={squareSize}
        height={squareSize}
        rx="10"
        ry="10"
        fill={isDark ? "#0f1a2d" : "#ffffff"}
        stroke={isDark ? "#1e2a44" : "#e2e8f0"}
        strokeWidth="1"
      />
      {/* Eagle emoji as SVG text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size * 2} // scales with your size prop
        style={{
          filter: blueEagleFilter,
        }}
      >
        🦅
      </text>
    </svg>
  );
}
import React, { useRef, useEffect } from "react";

export default function MentionTextarea({ value, onChange, placeholder, disabled }) {
  const textRef = useRef(null);
  const overlayRef = useRef(null);

  // Highlight @mentions in blue
  const highlightText = (text) => {
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return escaped.replace(
      /(@\w+)/g,
      `<span class="text-blue-500 font-semibold">$1</span>`
    );
  };

  // Keep overlay scroll synced with textarea
  useEffect(() => {
    const handleScroll = () => {
      overlayRef.current.scrollTop = textRef.current.scrollTop;
    };
    const ta = textRef.current;
    ta.addEventListener("scroll", handleScroll);
    return () => ta.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative w-full">
      {/* Highlight layer */}
      <div
        ref={overlayRef}
        className="absolute inset-0 p-2 whitespace-pre-wrap break-words text-sm text-gray-800 dark:text-gray-100 overflow-y-auto pointer-events-none font-normal"
        dangerouslySetInnerHTML={{ __html: highlightText(value) + "\n" }}
      />

      {/* Transparent textarea */}
      <textarea
        ref={textRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="relative w-full text-sm text-gray-800 dark:text-gray-100 resize-none border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-transparent focus:ring-2 focus:ring-blue-400 z-10"
        rows={3}
        style={{
          color: "transparent",
          caretColor: "#fff",
          backgroundColor: "transparent",
        }}
      />
    </div>
  );
}
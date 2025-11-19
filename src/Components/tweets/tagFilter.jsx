// ============================================
// FILE 1: components/TagFilter.jsx (NEW FILE)
// ============================================

import React from "react";
import { useNavigate } from "react-router-dom";

function TagFilter({ tags, activeTag = "", navigateMode = false, onTagClick }) {
  const navigate = useNavigate();

  const handleTagClick = (tag) => {
    if (navigateMode) {
      // Navigate to tweet feed with tag filter
      navigate(`/tweets?tag=${encodeURIComponent(tag)}`);
    } else if (onTagClick) {
      // Local filtering
      onTagClick(tag);
    }
  };

  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {tags.map((tag, idx) => (
        <button
          key={idx}
          onClick={(e) => {
            e.stopPropagation();
            handleTagClick(tag);
          }}
          className={`text-sm px-3 py-1 rounded-full transition-all font-medium ${
            activeTag === tag
              ? "bg-blue-500 text-white shadow-lg"
              : "border border-blue-500 text-blue-500 hover:bg-blue-50"
          }`}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
}

export default TagFilter;
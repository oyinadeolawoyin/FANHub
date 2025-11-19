// CommentContent.jsx - Reusable component to parse and render @mentions
import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Parse comment content and convert @mentions to clickable links
 * @param {string} content - Comment content with @mentions
 * @param {Array} mentions - Array of mention objects from API (optional)
 * @returns {JSX.Element}
 */
function CommentContent({ content, mentions = [], className = "" }) {
  const navigate = useNavigate();
  console.log("men", mentions, "content", content);
  // Create a map of username to user data for quick lookup
  const mentionMap = mentions.reduce((acc, mention) => {
    if (mention?.user) {
      acc[mention.user.username] = mention.user;
    }
    return acc;
  }, {});

  // Split content by @mentions and create clickable links
  const parts = content.split(/(@\w+)/g);

  return (
    <p className={className}>
      {parts.map((part, index) => {
        // Check if this part is a mention
        if (part.startsWith('@')) {
          const username = part.slice(1); // Remove @ symbol
          const mentionedUser = mentionMap[username];

          if (mentionedUser) {
            return (
              <span
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/profile/${mentionedUser.username}/${mentionedUser.id}/about`);
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-semibold cursor-pointer transition-colors"
              >
                @{username}
              </span>
            );
          }
          
          // If mention not found in map, still show it styled but not clickable
          return (
            <span key={index} className="text-blue-600 dark:text-blue-400 font-semibold">
              @{username}
            </span>
          );
        }
        
        // Regular text
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
}

export default CommentContent;
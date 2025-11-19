import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/authContext';

const RecommendationContext = createContext();

export const useRecommendations = () => {
  const context = useContext(RecommendationContext);
  if (!context) {
    throw new Error('useRecommendations must be used within RecommendationProvider');
  }
  return context;
};

export const RecommendationProvider = ({ children }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch all user's recommendation lists
  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/recommendations/${user.id}/my-lists`,
        {
          credentials: 'include',
        }
      );
      const data = await response.json();

      if (response.ok) {
        setRecommendations(data.recommendations);
      } else {
        setError(data.message || 'Failed to fetch recommendations');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check if a story is in a specific list
  const isStoryInList = (listId, storyId) => {
    const list = recommendations.find(rec => rec.id === listId);
    if (!list) return false;
    return list.stories.some(s => s.storyId === storyId);
  };

  // Add story to a recommendation list
  const addStoryToList = async (listId, storyId) => {
    try {
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/recommendations/${listId}/stories`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ storyId }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update local state to reflect the change
        setRecommendations(prev =>
          prev.map(rec =>
            rec.id === listId
              ? {
                  ...rec,
                  stories: [...rec.stories, { storyId, story: data.story }],
                  _count: {
                    ...rec._count,
                    stories: rec._count.stories + 1
                  }
                }
              : rec
          )
        );
        return { success: true, message: 'Story added successfully' };
      } else {
        return { success: false, message: data.message || 'Failed to add story' };
      }
    } catch (err) {
      console.error('Error adding story:', err);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Remove story from a recommendation list
  const removeStoryFromList = async (listId, storyId) => {
    try {
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/recommendations/${listId}/stories/${storyId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (response.ok) {
        // Update local state
        setRecommendations(prev =>
          prev.map(rec =>
            rec.id === listId
              ? {
                  ...rec,
                  stories: rec.stories.filter(s => s.storyId !== storyId),
                  _count: {
                    ...rec._count,
                    stories: rec._count.stories - 1
                  }
                }
              : rec
          )
        );
        return { success: true, message: 'Story removed successfully' };
      } else {
        return { success: false, message: 'Failed to remove story' };
      }
    } catch (err) {
      console.error('Error removing story:', err);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Get lists that contain a specific story
  const getListsWithStory = (storyId) => {
    return recommendations.filter(rec =>
      rec.stories.some(s => s.storyId === storyId)
    );
  };

  // Refresh recommendations
  const refreshRecommendations = () => {
    fetchRecommendations();
  };

  const value = {
    recommendations,
    loading,
    error,
    fetchRecommendations,
    isStoryInList,
    addStoryToList,
    removeStoryFromList,
    getListsWithStory,
    refreshRecommendations,
  };

  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
};
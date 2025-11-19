import { useState, useEffect } from 'react';
import { ListPlus, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRecommendations } from './recommendationContext';
import { useToast } from "../utils/toast-modal";

const AddToRecommendationList = ({ storyId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { 
    recommendations, 
    loading, 
    fetchRecommendations, 
    addStoryToList, 
    isStoryInList 
  } = useRecommendations();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && recommendations.length === 0) {
      fetchRecommendations();
    }
  }, [isOpen]);

  const handleAddToList = async (listId) => {
    setSubmitting(true);
    const result = await addStoryToList(listId, storyId);
    
    if (result.success) {
      showToast('Story added to list successfully!', 'success');
    } else {
      showToast(result.message, 'info');
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl transition-all hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'var(--card-bg)',
            color: 'var(--foreground-color)',
            border: '2px solid var(--border-color)',
          }}
        >
          <ListPlus className="w-5 h-5" />
          <span className="font-semibold">Add to Rec List</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-card-theme border-theme max-w-[calc(100%-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-theme text-lg sm:text-xl">
            Add to Recommendation List
          </DialogTitle>
          <DialogDescription className="text-secondary text-sm">
            Choose which list to add this story to
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8">
            <ListPlus className="w-12 h-12 mx-auto text-secondary opacity-50 mb-3" />
            <p className="text-theme font-medium mb-2">No recommendation lists yet</p>
            <p className="text-secondary text-sm mb-4">
              Create your first list to start curating stories
            </p>
            <Button
              onClick={() => {
                setIsOpen(false);
                // Navigate to create list page or open create modal
                window.location.href = '/dashboard/recommendations';
              }}
              className="btn"
            >
              Create Your First List
            </Button>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-2">
              {recommendations.map((list) => {
                const hasStory = isStoryInList(list.id, storyId);
                return (
                  <button
                    key={list.id}
                    onClick={() => !hasStory && handleAddToList(list.id)}
                    disabled={hasStory || submitting}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      hasStory
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 cursor-not-allowed'
                        : 'border-theme hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-theme truncate">
                            {list.title}
                          </h3>
                          {hasStory && (
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                        {list.description && (
                          <p className="text-xs text-secondary line-clamp-2">
                            {list.description}
                          </p>
                        )}
                        <p className="text-xs text-secondary mt-1">
                          {list._count?.stories || 0} stories
                        </p>
                      </div>
                      {list.coverImage && (
                        <img
                          src={list.coverImage}
                          alt={list.title}
                          className="w-16 h-16 rounded object-cover flex-shrink-0"
                        />
                      )}
                    </div>
                    {hasStory && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                        ✓ Already in this list
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddToRecommendationList;
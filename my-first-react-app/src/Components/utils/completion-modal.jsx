import { X, PartyPopper, Share2, List } from "lucide-react";

export function CompletionModal({ 
  isOpen, 
  onClose, 
  itemName, 
  itemAuthor,
  onShareToTweets,
  onAddToRecommendation 
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      {/* Wrapper for vertical centering with overflow */}
      <div className="min-h-screen w-full flex items-center justify-center py-8">
        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-auto p-6 relative shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Celebration Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <PartyPopper className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>

          {/* Congratulations Message */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-theme mb-2">
              Congratulations! 🎉
            </h2>
            <p className="text-secondary text-xs sm:text-sm mb-1">
              You've completed
            </p>
            <p className="text-base sm:text-lg font-semibold text-theme mb-1 line-clamp-2 px-2">
              "{itemName}"
            </p>
            {itemAuthor && (
              <p className="text-xs sm:text-sm text-secondary">
                by {itemAuthor}
              </p>
            )}
          </div>

          {/* Encouragement Text */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs sm:text-sm text-center text-secondary">
              Loved this story? Share your thoughts with others or add it to your recommendation list!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={onShareToTweets}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              Share to Tweets Feed
            </button>

            <button
              onClick={onAddToRecommendation}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <List className="w-4 h-4 sm:w-5 sm:h-5" />
              Add to Recommendation List
            </button>

            <button
              onClick={onClose}
              className="w-full border-2 border-gray-300 dark:border-gray-600 text-secondary hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
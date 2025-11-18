import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ListChecks, BookOpen, Heart, Star, MessageCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function ProfileRecommendationPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams(); // Get userId from route params
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublishedRecommendations();
  }, [id]);

  const fetchPublishedRecommendations = async () => {
    try {
      // Fetch only published recommendations for this user
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/recommendations/${id}/published`,
        {
          credentials: 'include',
        }
      );
      const data = await response.json();
      if (response.ok) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex-shrink-0">
            <ListChecks className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-theme">
            Recommendation Lists
          </h2>
        </div>
        <p className="text-sm sm:text-base text-secondary ml-14 sm:ml-16">
          Curated story collections
        </p>
      </div>

      {/* Empty State */}
      {recommendations.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center border-2 border-dashed">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <ListChecks className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg sm:text-xl font-semibold text-theme mb-2">
                No recommendation lists yet
              </h3>
              <p className="text-sm sm:text-base text-secondary">
                This user hasn't published any recommendation lists
              </p>
            </div>
          </div>
        </Card>
      ) : (
        /* Recommendation Lists Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {recommendations.map((rec) => (
            <Card
              key={rec.id}
              className="group overflow-hidden cursor-pointer p-0 hover:shadow-lg transition-shadow duration-300"
              onClick={() => navigate(`/recommendation/${rec.id}`)}
            >
              {/* Cover Image */}
              <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600">
                {rec.coverImage ? (
                  <img
                    src={rec.coverImage}
                    alt={rec.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ListChecks className="w-12 h-12 sm:w-16 sm:h-16 text-white/80" />
                  </div>
                )}

                {/* Story Count Badge */}
                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                  <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm">
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{rec._count?.stories || 0} stories</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-bold text-theme mb-2 line-clamp-2 group-hover:text-blue-500 transition-colors">
                  {rec.title}
                </h3>
                {rec.description && (
                  <p className="text-xs sm:text-sm text-secondary line-clamp-2 mb-3 sm:mb-4">
                    {rec.description}
                  </p>
                )}

                {/* Story Previews */}
                {rec.stories && rec.stories.length > 0 && (
                  <div className="flex -space-x-2 mb-3 sm:mb-4">
                    {rec.stories.slice(0, 4).map((story, idx) => (
                      <img
                        key={idx}
                        src={story.story?.imgUrl}
                        alt={story.story?.title}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                      />
                    ))}
                    {rec._count?.stories > 4 && (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                        +{rec._count.stories - 4}
                      </div>
                    )}
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-secondary">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                    <span className="font-medium">{rec._count?.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                    <span className="font-medium">{rec._count?.comments || 0}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
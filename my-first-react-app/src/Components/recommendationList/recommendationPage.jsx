import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Compass, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Toast, ConfirmDialog, useToast, useConfirm } from '../utils/toast-modal';
import { useAuth } from '../auth/authContext';
import { useRecommendations } from './recommendationContext';

const RecommendationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removingStoryId, setRemovingStoryId] = useState(null);
  const { toast, showToast, closeToast } = useToast();
  const { confirm, showConfirm, closeConfirm } = useConfirm();
  const { removeStoryFromList } = useRecommendations();

  useEffect(() => {
    async function fetchList() {
      try {
        const res = await fetch(`https://fanhub-server.onrender.com/api/recommendations/${id}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        
        if (res.ok) {
          setList(data.recommendation);
        } else {
          showToast('Failed to load recommendation list', 'error');
        }
      } catch (err) {
        console.error("Failed to fetch recommendation list:", err);
        showToast('Failed to load recommendation list', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchList();
  }, [id]);

  const handleRemoveStory = async (storyId) => {
    setRemovingStoryId(storyId);
    
    try {
      const result = await removeStoryFromList(Number(id), storyId);
      
      if (result.success) {
        // Update local state
        setList(prev => ({
          ...prev,
          stories: prev.stories.filter(s => s.story.id !== storyId),
          _count: {
            ...prev._count,
            stories: prev._count.stories - 1
          }
        }));
        showToast('Story removed successfully', 'success');
      } else {
        showToast(result.message || 'Failed to remove story', 'error');
      }
    } catch (error) {
      console.error('Error removing story:', error);
      showToast('Failed to remove story', 'error');
    } finally {
      setRemovingStoryId(null);
    }
  };

  const isOwner = user && list && user.id === list.userId;

  const getStatusBadge = (status) => {
    const variants = {
      COMPLETED: 'default',
      ONGOING: 'secondary',
      HIATUS: 'outline'
    };
    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status?.toLowerCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
          <div className="h-48 bg-card-theme rounded-2xl animate-pulse" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-card-theme rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-theme p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-theme shadow-md text-center py-12">
            <CardContent>
              <BookOpen className="w-16 h-16 mx-auto text-secondary opacity-50 mb-4" />
              <p className="text-xl font-semibold text-theme mb-2">
                Recommendation Not Found
              </p>
              <p className="text-secondary">
                This recommendation list doesn't exist or has been removed
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast {...toast} onClose={closeToast} />
      <ConfirmDialog
        {...confirm}
        onClose={closeConfirm}
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
      />
      
      <div className="min-h-screen bg-theme p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Header Section */}
          <Card className="border-theme shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeIn">
            <CardHeader className="space-y-4 pb-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary">
                      <AvatarImage src={list.user?.img} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {list.user?.username?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs sm:text-sm text-secondary font-medium">Curated by</p>
                      <p className="text-sm sm:text-base font-semibold text-theme flex items-center gap-2">
                        {list.user?.username}
                        <Badge variant="outline" className="text-xs">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {list._count?.stories || 0} Stories
                        </Badge>
                      </p>
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">
                    {list.title}
                  </CardTitle>
                  
                  {list.description && (
                    <CardDescription className="text-sm sm:text-base text-secondary leading-relaxed">
                      {list.description}
                    </CardDescription>
                  )}

                  <div className="flex items-center gap-4 text-xs sm:text-sm text-secondary pt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {new Date(list.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Stories Grid */}
          {list.stories && list.stories.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {list.stories.map(({ order, story }, index) => (
                <Card 
                  key={story?.id}
                  className="border-theme shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group animate-fadeIn cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => navigate(`/stories/${story?.id}`)}
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img 
                      src={story?.imgUrl} 
                      alt={story?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-primary text-primary-foreground font-bold shadow-lg">
                        #{order}
                      </Badge>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {story?.primarygenre}
                        </Badge>
                        {story?.secondarygenre && (
                          <Badge variant="outline" className="text-xs bg-white/10 backdrop-blur-sm">
                            {story?.secondarygenre}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <CardHeader className="space-y-3 pb-4">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg sm:text-xl font-bold text-theme line-clamp-2 group-hover:text-primary transition-colors">
                        {story?.title}
                      </CardTitle>
                      {getStatusBadge(story?.status)}
                    </div>
                    
                    <CardDescription className="text-xs sm:text-sm text-secondary line-clamp-3 leading-relaxed">
                      {story?.summary}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 pb-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border border-border-theme flex-shrink-0">
                          <AvatarImage src={story?.user?.img} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {story?.user?.username?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <p className="text-[10px] sm:text-xs text-secondary">By</p>
                          <p className="text-xs sm:text-sm font-medium text-theme truncate">
                            {story?.user?.username}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <Button 
                          size="sm"
                          className="btn text-xs sm:text-sm px-2 sm:px-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/stories/${story?.id}`);
                          }}
                          aria-label={`Read ${story?.title}`}
                        >
                          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Read</span>
                        </Button>
                        {isOwner && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              showConfirm(
                                'Remove Story',
                                `Are you sure you want to remove "${story?.title}" from this list?`,
                                () => handleRemoveStory(story?.id)
                              );
                            }}
                            disabled={removingStoryId === story?.id}
                            aria-label={`Remove ${story?.title} from list`}
                          >
                            {removingStoryId === story?.id ? (
                              <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Empty State */
            <Card className="border-theme shadow-md text-center py-12">
              <CardContent>
                <Compass className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-blue-500 mb-4" />
                <p className="text-lg sm:text-xl font-semibold text-theme mb-2">
                  No Stories Yet
                </p>
                <p className="text-sm sm:text-base text-secondary mb-6">
                  This recommendation list is empty. Start exploring and add your favorite stories!
                </p>
                <Button 
                  onClick={() => navigate('/homestories')}
                  className="btn"
                >
                  <Compass className="w-4 h-4 mr-2" />
                  Start Browsing Stories Now
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default RecommendationPage;
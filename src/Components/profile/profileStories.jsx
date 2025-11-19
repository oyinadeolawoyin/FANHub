// ============================================
// PROFILE STORIES.JSX - Redesigned with Icons + Touch-Friendly Search
// ============================================
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Heart, Eye, Search, Star, X } from "lucide-react";

function ProfileStories() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryStatus, setLibraryStatus] = useState({});

  useEffect(() => {
    async function fetchStories() {
      setError("");
      setLoading(true);
      try {
        const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/published`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (response.status === 500) {
          navigate("/error", { state: { message: data.message || "Process failed" } });
          return;
        } else if (!response.ok) {
          setError(data.message);
          return;
        }

        setStories(data.stories);
        
        const statusMap = {};
        data.stories.forEach((story) => {
          statusMap[story.id] = story?.library?.length > 0;
        });

        setLibraryStatus((prev) => ({ ...prev, ...statusMap }));
      } catch (err) {
        navigate("/error", {
          state: { message: "Network error: Please check your internet connection." },
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStories();
  }, [id, navigate]);

  function handleSearch(e) {
    e.preventDefault();
    if (stories.length) {
      const results = stories.filter((s) =>
        s.title.toLowerCase().includes(search.toLowerCase())
      );
      setSearchResults(results);
    }
  }

  function clearSearch() {
    setSearch("");
    setSearchResults([]);
  }

  useEffect(() => {
    if (search.trim() === "") setSearchResults([]);
  }, [search]);

  async function addToLibrary(storyId) {
    setError("");
    setLibraryLoading(storyId);
    try {
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/stories/${storyId}/readinglist`,
        { method: "POST", credentials: "include" }
      );
      const data = await response.json();

      if (response.status === 500) {
        navigate("/error", { state: { message: data.message || "Process failed" } });
        return;
      } else if (!response.ok) {
        setError(data.message);
        return;
      }

      setLibraryStatus((prev) => ({ ...prev, [storyId]: !prev[storyId] }));
    } catch (err) {
      navigate("/error", {
        state: { message: "Network error: Please check your internet connection." },
      });
    } finally {
      setLibraryLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" role="status" aria-live="polite">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Search Form with Touch-Friendly Button */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories by title..."
            className="pl-10 pr-10"
            aria-label="Search stories"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <Button 
          type="submit" 
          size="icon"
          className="flex-shrink-0"
          aria-label="Search"
        >
          <Search size={18} />
        </Button>
      </form>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg" role="alert">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      )}

      <Stories
        stories={searchResults.length > 0 ? searchResults : stories}
        addToLibrary={addToLibrary}
        libraryLoading={libraryLoading}
        libraryStatus={libraryStatus}
      />
    </div>
  );
}

function Stories({ stories, addToLibrary, libraryLoading, libraryStatus }) {
  const navigate = useNavigate();

  if (stories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No stories found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story) => {
        const isInLibrary = libraryStatus[story.id] || false;
        return (
          <Card 
            key={story.id} 
            className="overflow-hidden hover:shadow-xl transition-all group"
            onClick={() => navigate(`/stories/${story.id}`)}
          >
            <div
              className="relative cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`View story: ${story.title}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/stories/${story.id}`);
                }
              }}
            >
              <img
                src={story.imgUrl}
                alt={story.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {story.title}
              </h3>

              <p className="text-sm text-muted-foreground line-clamp-3">{story.summary}</p>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded">{story.primarygenre}</span>
                {story.secondarygenre && (
                  <span className="px-2 py-1 bg-accent/10 text-primary rounded">
                    {story.secondarygenre}
                  </span>
                )}
                <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded">{story.status}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1 text-blue-500">
                  <Eye className="w-4 h-4" /> {story._count.views}
                </span>
                <span className="flex items-center gap-1 text-red-500">
                  <Heart className="w-4 h-4" /> {story._count.likes}
                </span>
                <span className="flex items-center gap-1 text-blue-500">
                  <BookOpen className="w-4 h-4" /> {story._count.chapters}
                </span>
                <span className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4" /> {story._count.reviews}
                </span>
              </div>

              <Button
                disabled={libraryLoading === story.id}
                onClick={(e) => {
                  e.stopPropagation();
                  addToLibrary(story.id);
                }}
                className="w-full btn"
                aria-label={isInLibrary ? "Remove from library" : "Add to library"}
              >
                {libraryLoading === story.id
                  ? "Loading..."
                  : isInLibrary
                  ? "Remove from Library"
                  : "Add to Library"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default ProfileStories;
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import GenreSelector from "../genre/genreSelector";
import { useAuth } from "../auth/authContext";
import Header from "../css/header";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, Filter, Eye, Heart, Loader2, X, ChevronDown, BookOpen, FileText, Zap } from "lucide-react";
import Footer from "../css/footer";

function Homestories() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [storyLoading, setStoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [stories, setStories] = useState([]);
  const [storyPage, setStoryPage] = useState(1);
  const [storyHasMore, setStoryHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const observerRef = useRef(null);

  const [storyFilters, setStoryFilters] = useState({
    primarygenre: "romance",
    secondarygenre: "",
    primarysubgenre: "mystery",
    secondarysubgenre: "",
    age: "young adult",
    audience: "general",
    status: "ongoing",
    type: "novel",
    sort: "recent",
  });

  // Type icon mapping
  const typeIcons = {
    "novel": BookOpen,
    "short story": FileText,
    "Flash story": Zap
  };

  const TypeIcon = typeIcons[storyFilters.type] || BookOpen;

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Reset stories on filter change
  useEffect(() => {
    setStories([]);
    setStoryPage(1);
    setStoryHasMore(true);
  }, [storyFilters]);

  // Fetch stories
  useEffect(() => {
    async function fetchStories() {
      setError("");
      setStoryLoading(true);
      try {
        const params = new URLSearchParams({
          page: storyPage,
          limit: 12,
          ...storyFilters,
        });

        const response = await fetch(
          `https://fanhub-server.onrender.com/api/home/stories?${params.toString()}`,
          { method: "GET", credentials: "include" }
        );
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 500)
            navigate("/error", { state: { message: data.message || "Process failed" } });
          else setError(data.message);
          return;
        }

        const storiesData = data.stories || [];
        setStories(prev => {
          const newStories = storiesData.filter(s => !prev.some(ps => ps.id === s.id));
          return [...prev, ...newStories];
        });

        if (storyPage >= (data.pagination?.totalPages || 1)) setStoryHasMore(false);
      } catch (err) {
        navigate("/error", { state: { message: err.message } });
      } finally {
        setStoryLoading(false);
      }
    }

    fetchStories();
  }, [storyPage, storyFilters, navigate]);

  // Infinite scroll
  useEffect(() => {
    if (storyLoading) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && storyHasMore) {
        setStoryPage(prev => prev + 1);
      }
    }, { threshold: 0.2 });

    const currentTarget = observerRef.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => currentTarget && observer.unobserve(currentTarget);
  }, [storyLoading, storyHasMore]);

  // Handle search
  async function handleSearch(e) {
    e.preventDefault();
    setSearchLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        query: search,
        page: 1,
        limit: 12,
      });

      const response = await fetch(
        `https://fanhub-server.onrender.com/api/home/stories/search?${params.toString()}`,
        { method: "GET", credentials: "include" }
      );
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 500)
          navigate("/error", { state: { message: data.message || "Process failed" } });
        else setError(data.message);
        return;
      }

      setStories(data.stories);
      setStoryHasMore(false);
    } catch {
      navigate("/error", {
        state: { message: "Network error: Please check your internet connection." },
      });
    } finally {
      setSearchLoading(false);
    }
  }

  async function view(storyId) {
    try {
      await fetch(`https://fanhub-server.onrender.com/api/stories/${storyId}/view`, {
        method: "POST",
        credentials: "include",
      });
      await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/social/readingpoint`, {
        method: "POST",
        credentials: "include",
      });
      await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/readingStreak`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      navigate("/error", {
        state: { message: "Network error: Please check your internet connection." },
      });
    }
  }

  const handleStoryClick = (storyId) => {
    view(storyId);
    navigate(`/stories/${storyId}`);
  };

  const clearSearch = async () => {
    setSearch("");
    setStories([]);
    setStoryPage(1);
    setStoryHasMore(true);
  
    try {
      setStoryLoading(true);
      const params = new URLSearchParams({
        page: 1,
        limit: 12,
        ...storyFilters,
      });
  
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/home/stories?${params.toString()}`,
        { method: "GET", credentials: "include" }
      );
      const data = await response.json();
  
      if (response.ok) {
        setStories(data.stories || []);
      } else {
        setError(data.message || "Failed to load stories");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setStoryLoading(false);
    }
  };

  useEffect(() => {
    if (search === "") {
      clearSearch();
    }
  }, [search]);
  
  const StorySkeleton = () => (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: "var(--card-bg)" }}
    >
      {/* Image skeleton */}
      <Skeleton className="w-full aspect-[2/3] rounded-xl" />
  
      <div className="p-2 space-y-2">
        {/* Title skeleton lines */}
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-4 w-1/2 rounded-md" />
      </div>
    </div>
  );
  
  return (
    <div
      className="min-h-screen transition-colors duration-500"
      style={{ backgroundColor: "var(--background-color)" }}
    >
      {/* HEADER */}
      <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Spacer */}
      <div className="h-6"></div>

      <main 
        className="px-4 py-10 md:px-8 pt-32 md:pt-36" 
        role="main"
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-xl p-4" role="alert">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Search and Filter Section */}
          <div className="space-y-4">
            {/* Enhanced Search Bar */}
            <form
              onSubmit={handleSearch}
              className="relative mb-8 px-4 sm:px-6 lg:px-0"
              role="search"
              aria-label="Search stories"
            >
              {/* Large Hero Search Bar */}
              <div className="relative max-w-4xl mx-auto w-full">
                <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                  {/* Main Search Input */}
                  <div className="relative flex-1 w-full">
                    <Search
                      className="absolute left-5 sm:left-6 top-1/2 transform -translate-y-1/2 w-5 sm:w-6 h-5 sm:h-6 transition-all duration-300"
                      style={{
                        color: search ? "var(--accent-color)" : "var(--secondary-text)",
                        opacity: search ? 1 : 0.5,
                      }}
                    />

                    <Input
                      id="storySearch"
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="What story are you looking for today?"
                      className="pl-14 sm:pl-16 pr-12 sm:pr-14 py-4 sm:py-8 w-full rounded-2xl text-base sm:text-lg font-medium shadow-2xl border-0 focus:ring-4 focus:ring-offset-0 transition-all duration-300 placeholder:text-sm sm:placeholder:text-base"
                      style={{
                        backgroundColor: "var(--card-bg)",
                        color: "var(--foreground-color)",
                        boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                      }}
                    />

                    {/* Clear Button */}
                    {search && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-4 sm:right-5 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                        style={{
                          backgroundColor: "var(--accent-color)" + "15",
                        }}
                        aria-label="Clear search"
                      >
                        <X className="w-4 sm:w-5 h-4 sm:h-5" style={{ color: "var(--accent-color)" }} />
                      </button>
                    )}
                  </div>

                  {/* Search Button */}
                  <Button
                    type="submit"
                    disabled={searchLoading || !search}
                    className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-8 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 shadow-2xl border-0"
                    style={{
                      backgroundColor: "var(--button-bg)",
                      color: "var(--button-text)",
                    }}
                  >
                    {searchLoading ? (
                      <Loader2 className="w-5 sm:w-6 h-5 sm:h-6 animate-spin" />
                    ) : (
                      "Search"
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {/* Filter Pills - Below Search */}
            <div className="flex flex-wrap gap-3 items-center justify-center max-w-4xl mx-auto mb-8 px-4 sm:px-6">
              {/* Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 border-0"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      color: "var(--foreground-color)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="p-3 sm:p-4 w-64 sm:w-80 shadow-2xl rounded-xl"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                  }}
                  aria-label="Filter options"
                >
                  <GenreSelector
                    storyFilters={storyFilters}
                    setStoryFilters={setStoryFilters}
                  />
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Type Filter with Icon */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 capitalize border-0"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      color: "var(--foreground-color)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  >
                    <TypeIcon className="w-4 h-4" />
                    {storyFilters.type}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="p-3 w-48 sm:w-52 rounded-xl shadow-2xl"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                  }}
                >
                  {["novel", "short story", "Flash story"].map((type) => {
                    const Icon = typeIcons[type];
                    return (
                      <button
                        key={type}
                        onClick={() => setStoryFilters((f) => ({ ...f, type }))}
                        className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-blue-500/10 transition-all duration-200 flex items-center gap-3 capitalize font-medium"
                        style={{
                          color:
                            storyFilters.type === type
                              ? "var(--accent-color)"
                              : "var(--foreground-color)",
                          backgroundColor:
                            storyFilters.type === type
                              ? "var(--accent-color)" + "15"
                              : "transparent",
                        }}
                      >
                        <Icon className="w-4 h-4" />
                        {type}
                      </button>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* SKELETON LOADING CARDS */}
          {storyLoading && stories.length === 0 && (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <StorySkeleton key={i} />
              ))}
            </div>
          )}

          {/* Stories Grid */}
          <section aria-label="Story list">
            {stories.length === 0 && !storyLoading ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--card-bg)" }}>
                  <Search className="w-12 h-12" style={{ color: "var(--secondary-text)" }} />
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground-color)" }}>
                  No stories found
                </h2>
                <p style={{ color: "var(--secondary-text)" }}>
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {stories.map((story, i) => (
                  <article
                    key={story.id}
                    onClick={() => handleStoryClick(story.id)}
                    className="group cursor-pointer rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 focus-within:ring-2 focus-within:ring-blue-500"
                    style={{
                      backgroundColor: "var(--card-bg)"
                    }}
                    tabIndex={0}
                    role="button"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleStoryClick(story.id);
                      }
                    }}
                    aria-label={`Read ${story.title}`}
                  >
                    {/* Cover Image */}
                    <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-md">
                      <img
                        src={story.imgUrl}
                        alt={`Cover for ${story.title}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Hover Stats Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                        <div className="flex items-center justify-between text-white text-xs">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-blue-400" />
                            {story._count.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-400" />
                            {story._count.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-yellow-400">⭐</span>
                            {story._count.reviews}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Story Title */}
                    <div className="p-2">
                      <h2 
                        className="font-semibold text-sm line-clamp-2 leading-tight" 
                        style={{ color: "var(--foreground-color)" }}
                      >
                        {story.title}
                      </h2>
                    </div>

                    {/* Intersection Observer Target */}
                    {i === stories.length - 1 && <div ref={observerRef} className="h-1" aria-hidden="true"></div>}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

export default Homestories;
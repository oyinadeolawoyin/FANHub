import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import GenreSelector from "../genre/genreSelector";
import Header from "../css/header";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Search, Filter, Eye, Heart, Loader2, X, ChevronDown, BookOpen } from "lucide-react";

function Homecollections() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [collectionLoading, setCollectionLoading] = useState(false);
  const [error, setError] = useState("");
  const [collections, setCollections] = useState([]);
  const [collectionPage, setCollectionPage] = useState(1);
  const [collectionHasMore, setCollectionHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const observerRef = useRef(null);
  const [collectionFilters, setCollectionFilters] = useState({
    primarygenre: "mystery",
    secondarygenre: "",
    primarysubgenre: "romance",
    secondarysubgenre: "",
    age: "young adult",
    audience: "general",
    status: "ongoing",
    sort: "recent",
  });

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

  // Reset collections when filters change
  useEffect(() => {
    setCollections([]);
    setCollectionPage(1);
    setCollectionHasMore(true);
  }, [collectionFilters]);

  // Fetch collections
  useEffect(() => {
    async function fetchCollections() {
      setError("");
      setCollectionLoading(true);
      try {
        const params = new URLSearchParams({ page: collectionPage, limit: 12, ...collectionFilters });
        const response = await fetch(
          `https://fanhub-server.onrender.com/api/home/collections?${params.toString()}`,
          { method: "GET", credentials: "include" }
        );
        const data = await response.json();
        if (response.status === 500) {
          navigate("/error", { state: { message: data.message || "Process failed" } });
          return;
        } else if (!response.ok) {
          setError(data.message);
          return;
        }

        setCollections((prev) => {
          const newCollections = data.collections.filter(c => !prev.some(pc => pc.id === c.id));
          return [...prev, ...newCollections];
        });
        if (collectionPage >= data.pagination.totalPages) setCollectionHasMore(false);
      } catch {
        navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
      } finally {
        setCollectionLoading(false);
      }
    }
    fetchCollections();
  }, [collectionPage, collectionFilters, navigate]);

  // Infinite scroll
  useEffect(() => {
    if (collectionLoading) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && collectionHasMore) {
          setCollectionPage(prev => prev + 1);
        }
      },
      { threshold: 0.2 }
    );
    const currentTarget = observerRef.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => currentTarget && observer.unobserve(currentTarget);
  }, [collectionLoading, collectionHasMore]);

  // Handle search
  async function handleSearch(e) {
    e.preventDefault();
    setSearchLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ query: search, page: 1, limit: 12 });
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/home/collections/search?${params.toString()}`,
        { method: "GET", credentials: "include" }
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to search collections");
        return;
      }
      setCollections(data.collections);
      setCollectionHasMore(false);
    } catch {
      navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
    } finally {
      setSearchLoading(false);
    }
  }

  async function view(collectionId) {
    try {
      await fetch(`https://fanhub-server.onrender.com/api/gallery/collections/${collectionId}/view`, {
        method: "POST",
        credentials: "include",
      });
      navigate(`/gallery/${collectionId}`);
    } catch {
      navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
    }
  }

  const clearSearch = async () => {
    setSearch("");
    setCollections([]);
    setCollectionPage(1);
    setCollectionHasMore(true);
  };

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
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-xl p-4" role="alert">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Search Section */}
          <form onSubmit={handleSearch} className="relative max-w-4xl mx-auto w-full flex items-center gap-3 mb-8" role="search">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search collections..."
                className="pl-12 pr-12 py-3 w-full rounded-2xl shadow-lg border-0 focus:ring-2 focus:ring-primary transition-all"
                style={{ backgroundColor: "var(--card-bg)", color: "var(--foreground-color)" }}
              />
              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-200/50"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
            <Button type="submit" disabled={searchLoading || !search} className="px-6 py-3 rounded-2xl font-bold shadow-lg">
              {searchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
            </Button>
          </form>

          {/* Filter Section */}
          <div className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto mb-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-4 py-2 rounded-full font-semibold flex items-center gap-2 shadow-md">
                  <Filter className="w-4 h-4" /> Filters
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="p-4 w-64 sm:w-80 rounded-xl shadow-2xl">
                <GenreSelector storyFilters={collectionFilters} setStoryFilters={setCollectionFilters} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Collections Grid */}
          <section aria-label="Collection list">
            {collections.length === 0 && !collectionLoading ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-gray-200">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">No collections found</h2>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {collections.map((collection, i) => (
                  <article
                    key={collection.id}
                    onClick={() => view(collection.id)}
                    className="group cursor-pointer rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 focus-within:ring-2 focus-within:ring-blue-500"
                    tabIndex={0}
                    role="button"
                    aria-label={`View ${collection.name}`}
                    onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') view(collection.id); }}
                  >
                    {/* Cover Image */}
                    <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-md">
                      <img
                        src={collection.img}
                        alt={`Cover for ${collection.name}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {/* Hover Stats */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                        <div className="flex items-center justify-between text-white text-xs">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-blue-400" /> {collection._count.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-400" /> {collection._count.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-yellow-400">⭐</span> {collection._count.review}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Collection Title */}
                    <div className="p-2">
                      <h2 
                         className="font-semibold text-sm line-clamp-2 leading-tight" 
                         style={{ color: "var(--foreground-color)" }}
                      >
                        {collection.name}
                      </h2>
                    </div>
                    {i === collections.length - 1 && <div ref={observerRef} className="h-1" aria-hidden="true"></div>}
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Loading */}
          {collectionLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-accent-color" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Homecollections;
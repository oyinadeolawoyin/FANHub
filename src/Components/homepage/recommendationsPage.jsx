// RecommendationsPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, BookOpen, Filter, Search, X } from "lucide-react";
import Header from "../css/header";
import { useAuth } from "../auth/authContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Footer from "../css/footer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const RecommendationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Apply theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Fetch recommendations
  useEffect(() => {
    fetchRecommendations();
  }, [page, sortBy, sortOrder]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://fanhub-server.onrender.com/api/recommendations/featured?page=${page}&limit=12&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setRecommendations(data.recommendations || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        console.error("Failed to fetch recommendations:", data.message);
      }
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter recommendations by search query
  const filteredRecommendations = recommendations.filter((rec) =>
    rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.user?.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSortChange = (value) => {
    const [newSortBy, newSortOrder] = value.split("-");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  return (
    <div
      className="min-h-screen transition-colors duration-500"
      style={{
        backgroundColor: "var(--background-color)",
        color: "var(--foreground-color)",
      }}
    >
      {/* HEADER */}
      <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Spacer */}
      <div className="h-6"></div>

      {/* MAIN CONTENT */}
      <main className="px-4 py-10 md:px-8 pt-32 md:pt-36 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Reading Lists 📚
          </h1>
          <p className="text-lg opacity-80">
            Discover curated collections of stories from our community
          </p>
        </div>

        {/* Search & Filters Bar */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div
              className="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg transition-all"
              style={{
                backgroundColor: "var(--input-bg)",
                border: "1px solid var(--border-color)",
              }}
            >
              <Search size={20} style={{ color: "var(--secondary-text)" }} />
              <input
                type="text"
                placeholder="Search reading lists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none"
                style={{ color: "var(--foreground-color)" }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 hover:opacity-70 transition-opacity"
                >
                  <X size={18} style={{ color: "var(--secondary-text)" }} />
                </button>
              )}
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden px-4 py-3 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: "var(--button-bg)",
                color: "var(--button-text)",
              }}
            >
              <Filter size={20} />
            </button>

            {/* Sort Dropdown (Desktop) */}
            <div className="hidden sm:block min-w-[200px]">
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={handleSortChange}
              >
                <SelectTrigger
                  className="themed-select-trigger"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    borderColor: "var(--border-color)",
                    color: "var(--foreground-color)",
                  }}
                >
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent className="themed-select-content">
                  <SelectItem value="createdAt-desc" className="themed-select-item">
                    Newest First
                  </SelectItem>
                  <SelectItem value="createdAt-asc" className="themed-select-item">
                    Oldest First
                  </SelectItem>
                  <SelectItem value="updatedAt-desc" className="themed-select-item">
                    Recently Updated
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mobile Filter Dropdown */}
          {showFilters && (
            <div className="sm:hidden">
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={handleSortChange}
              >
                <SelectTrigger
                  className="themed-select-trigger w-full"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    borderColor: "var(--border-color)",
                    color: "var(--foreground-color)",
                  }}
                >
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent className="themed-select-content">
                  <SelectItem value="createdAt-desc" className="themed-select-item">
                    Newest First
                  </SelectItem>
                  <SelectItem value="createdAt-asc" className="themed-select-item">
                    Oldest First
                  </SelectItem>
                  <SelectItem value="updatedAt-desc" className="themed-select-item">
                    Recently Updated
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <div
                key={idx}
                className="rounded-lg overflow-hidden flex flex-col"
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                }}
              >
                {/* Cover Image Skeleton */}
                <Skeleton className="h-40 w-full" />

                {/* Card Content Skeleton */}
                <div className="p-4 flex flex-col flex-1 space-y-3">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-full rounded" />
                  <Skeleton className="h-3 w-2/3 rounded" />

                  {/* Story Previews Skeleton */}
                  <div className="flex gap-1 mt-2">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="w-12 h-16 rounded" />
                    ))}
                  </div>

                  {/* Avatar & Stats Skeleton */}
                  <div
                    className="flex items-center justify-between mt-auto pt-3 border-t"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-6 h-6 rounded-full" />
                      <Skeleton className="h-3 w-16 rounded" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-3 w-8 rounded" />
                      <Skeleton className="h-3 w-6 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations Grid */}
        {!loading && filteredRecommendations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredRecommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                darkMode={darkMode}
                navigate={navigate}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredRecommendations.length === 0 && (
          <div className="text-center py-16">
            <BookOpen
              size={64}
              className="mx-auto mb-4 opacity-30"
              style={{ color: "var(--secondary-text)" }}
            />
            <h3 className="text-xl font-semibold mb-2">No reading lists found</h3>
            <p className="opacity-70">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Be the first to create a reading list!"}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredRecommendations.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--button-bg)",
                color: "var(--button-text)",
              }}
            >
              Previous
            </button>

            <div className="flex items-center gap-2">
              {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = idx + 1;
                } else if (page <= 3) {
                  pageNum = idx + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + idx;
                } else {
                  pageNum = page - 2 + idx;
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setPage(pageNum)}
                    className="w-10 h-10 rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor:
                        page === pageNum
                          ? "var(--button-bg)"
                          : "var(--card-bg)",
                      color:
                        page === pageNum
                          ? "var(--button-text)"
                          : "var(--foreground-color)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--button-bg)",
                color: "var(--button-text)",
              }}
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

// Recommendation Card Component (Reusable)
function RecommendationCard({ recommendation, darkMode, navigate }) {
  const hasLiked = recommendation.likes?.length > 0;

  return (
    <div
      className="rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer group h-full flex flex-col"
      style={{
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--border-color)",
      }}
      onClick={() => navigate(`/recommendation/${recommendation.id}`)}
    >
      {/* Cover Image */}
      <div className="relative h-40 overflow-hidden flex-shrink-0">
        {recommendation.coverImage ? (
          <img
            src={recommendation.coverImage}
            alt={recommendation.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: darkMode
                ? "linear-gradient(135deg, #1e293b, #334155)"
                : "linear-gradient(135deg, #dbeafe, #e0e7ff)",
            }}
          >
            <BookOpen
              size={48}
              style={{
                color: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)",
              }}
            />
          </div>
        )}

        {/* Story Count Badge */}
        <div
          className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm"
          style={{
            backgroundColor: darkMode ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.9)",
            color: darkMode ? "#fff" : "#000",
          }}
        >
          {recommendation._count?.stories || 0} stories
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-bold text-lg mb-2 line-clamp-2 group-hover:underline"
          style={{ color: "var(--card-text)" }}
        >
          {recommendation.title}
        </h3>

        {recommendation.description && (
          <p className="text-sm opacity-70 mb-3 line-clamp-2 flex-1">
            {recommendation.description}
          </p>
        )}

        {/* Story Previews */}
        {recommendation.stories?.length > 0 && (
          <div className="flex gap-1 mb-3 overflow-hidden">
            {recommendation.stories.slice(0, 4).map((item) => (
              <div
                key={item.story.id}
                className="w-12 h-16 rounded flex-shrink-0"
                style={{
                  backgroundImage: item.story.imgUrl
                    ? `url(${item.story.imgUrl})`
                    : "none",
                  backgroundColor: item.story.imgUrl
                    ? "transparent"
                    : "var(--border-color)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                title={item.story.title}
              />
            ))}
          </div>
        )}

        {/* Creator Info & Stats */}
        <div
          className="flex items-center justify-between pt-3 border-t mt-auto"
          style={{ borderColor: "var(--border-color)" }}
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={recommendation.user?.img}
                alt={recommendation.user?.username}
              />
              <AvatarFallback
                className="text-xs"
                style={{
                  backgroundColor: "var(--button-bg)",
                  color: "var(--button-text)",
                }}
              >
                {recommendation.user?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium opacity-80">
              {recommendation.user?.username}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs opacity-70">
            <div className="flex items-center gap-1">
              <Heart
                size={14}
                fill={hasLiked ? "currentColor" : "none"}
                style={{ color: hasLiked ? "#ef4444" : "currentColor" }}
              />
              <span>{recommendation._count?.likes || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle size={14} />
              <span>{recommendation._count?.comments || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecommendationsPage;
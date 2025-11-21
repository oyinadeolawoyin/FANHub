// ============================================
// PROFILE COLLECTIONS.JSX - Updated (Lucide + Responsive Search + Touch-Friendly Button)
// ============================================
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Heart, Star, BookOpen, X, Eye } from "lucide-react";

function ProfileCollections() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryStatus, setLibraryStatus] = useState({});

  useEffect(() => {
    async function fetchCollections() {
      setError("");
      setLoading(true);
      try {
        const response = await fetch(
          `https://fanhub-server.onrender.com/api/gallery/collections/${id}/published`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (response.status === 500) {
          navigate("/error", {
            state: { message: data.message || "Process failed" },
          });
          return;
        } else if (!response.ok && response.status !== 500) {
          setError(data.message);
          return;
        }

        setCollections(data.collections);

        const statusMap = {};
        data.collections.forEach((collection) => {
          statusMap[collection.id] = collection.library.length > 0;
        });
        setLibraryStatus((prev) => ({ ...prev, ...statusMap }));
      } catch (err) {
        navigate("/error", {
          state: { message: err.message },
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, [id, navigate]);

  // 🔍 Search handler
  function handleSearch(e) {
    e.preventDefault();
    if (collections) {
      const results = collections.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
      setSearchResults(results);
    }
  }

  // Clear search
  function clearSearch() {
    setSearch("");
    setSearchResults([]);
  }

  useEffect(() => {
    if (search.trim() === "") setSearchResults([]);
  }, [search]);

  async function addToLibrary(id) {
    setError("");
    setLibraryLoading(true);

    try {
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/gallery/collection/${id}/readinglist`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 500) {
        navigate("/error", {
          state: { message: data.message || "Process failed" },
        });
        return;
      } else if (!response.ok && response.status !== 500) {
        setError(data.message);
        return;
      }

      setLibraryStatus((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    } catch (err) {
      navigate("/error", {
        state: { message: err.message },
      });
    } finally {
      setLibraryLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" role="status">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🔍 Enhanced Search bar with icon and touch-friendly button */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search collections..."
            className="pl-10 pr-10 text-sm sm:text-base"
            aria-label="Search collections"
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none w-5 h-5"
          />
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

      <Collections
        collections={searchResults.length > 0 ? searchResults : collections}
        loading={loading}
        addToLibrary={addToLibrary}
        libraryLoading={libraryLoading}
        libraryStatus={libraryStatus}
      />
    </div>
  );
}

// ==================== Collections ====================
function Collections({ collections, addToLibrary, libraryStatus, libraryLoading }) {
  const navigate = useNavigate();

  if (collections.length === 0) {
    return (
      <Card className="p-8 sm:p-12 text-center border-2 border-dashed">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-full">
            <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg sm:text-xl font-semibold text-theme mb-2">
              No collections yet
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              This user hasn't published any visual story collections
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection) => (
        <Card
          key={collection.id}
          className="overflow-hidden hover:shadow-xl transition-all group"
          onClick={() => navigate(`/gallery/${collection.id}`)}
        >
          <div
            className="relative cursor-pointer"
            role="button"
            tabIndex="0"
            aria-label={`View collection: ${collection.name}`}
          >
            <img
              src={collection.img}
              alt={collection.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {collection.name}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-3">
              {collection.description}
            </p>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                {collection.primarygenre}
              </span>
              {collection.secondarygenre && (
                <span className="px-2 py-1 bg-accent/10 text-primary rounded">
                  {collection.secondarygenre}
                </span>
              )}
              <span className="px-2 py-1 bg-primary/10 text-secondary-foreground rounded">
                {collection.status}
              </span>
            </div>

            {/* Stats icons */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-blue-500" /> {collection._count.views}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500" /> {collection._count.likes}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" /> {collection._count.review}
              </span>
            </div>

            <Button
              disabled={libraryLoading}
              onClick={(e) => {
                e.stopPropagation();
                addToLibrary(collection.id);
              }}
              className="w-full"
            >
              {libraryLoading ? (
                "Loading..."
              ) : libraryStatus[collection.id] ? (
                <>
                  Remove from Library
                </>
              ) : (
                <>
                  Add to Library
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default ProfileCollections;
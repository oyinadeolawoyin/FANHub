import { useAuth } from "./Components/auth/authContext";
import { Link, useNavigate } from "react-router-dom";
import NotificationsSetup from "./Components/notification/notificationSetup";
import { useState, useEffect } from "react";
import { Heart, MessageCircle, BookOpen, Eye } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Header from "./Components/css/header";
import "./Components/css/index.css";
import { useFollow } from "./Components/profile/useFollow";

const App = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredApi, setFeaturedApi] = useState(null);
  const [storiesApi, setStoriesApi] = useState(null);
  const [collectionsApi, setCollectionsApi] = useState(null);
  const [recommendationsApi, setRecommendationsApi] = useState(null);
  const [topWriters, setTopWriters] = useState([]);
  const [stories, setStories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Fetch stories
  useEffect(() => {
    async function fetchStories() {
      try {
        const params = new URLSearchParams({
          page: 1,
          limit: 12,
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

        const res = await fetch(
          `https://fanhub-server.onrender.com/api/home/stories?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await res.json();

        if (res.ok) {
          setStories(data.stories || []);
        }
      } catch (err) {
        console.error("Failed to fetch stories:", err);
      }
    }

    fetchStories();
  }, []);

  // Fetch collections
  useEffect(() => {
    async function fetchCollections() {
      try {
        const params = new URLSearchParams({
          page: 1,
          limit: 12,
          primarygenre: "mystery",
          secondarygenre: "",
          primarysubgenre: "romance",
          secondarysubgenre: "",
          age: "young adult",
          audience: "general",
          status: "ongoing",
          sort: "recent",
        });

        const res = await fetch(
          `https://fanhub-server.onrender.com/api/home/collections?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await res.json();

        if (res.ok) {
          setCollections(data.collections || []);
        }
      } catch (err) {
        console.error("Failed to fetch collections:", err);
      }
    }

    fetchCollections();
  }, []);

  // Fetch top 30 writers
  useEffect(() => {
    async function fetchTopWriters() {
      try {
        const res = await fetch(
          `https://fanhub-server.onrender.com/api/users/top-writers`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await res.json();

        if (res.status === 500) {
          navigate("/error", {
            state: { message: data.message || "Process failed" },
          });
          return;
        } else if (res.status === 401) {
          navigate("/login");
        } else if (!res.ok) {
          console.error(data.message);
          return;
        }

        setTopWriters(data.writers || []);
      } catch (err) {
        console.error("Failed to fetch top writers:", err);
      }
    }

    fetchTopWriters();
  }, [navigate]);

  // Fetch featured recommendations
  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const res = await fetch(
          `https://fanhub-server.onrender.com/api/recommendations/featured?limit=8`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await res.json();

        if (res.ok) {
          setRecommendations(data.recommendations || []);
        } else {
          console.error("Failed to fetch recommendations:", data.message);
        }
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
      }
    }

    fetchRecommendations();
  }, []);

  // Mock featured content
  const [featuredContent] = useState([
    {
      id: 1,
      title: "The Future of Web Development",
      author: "Sarah Chen",
      description:
        "Exploring the latest trends in modern web architecture and design patterns.",
      category: "Technology",
    },
    {
      id: 2,
      title: "Building Communities That Last",
      author: "Marcus Williams",
      description:
        "Insights on creating engaging and sustainable online communities.",
      category: "Community",
    },
    {
      id: 3,
      title: "Stories That Inspire Change",
      author: "Elena Rodriguez",
      description:
        "How authentic storytelling can transform lives and perspectives.",
      category: "Inspiration",
    },
    {
      id: 4,
      title: "The Art of Digital Expression",
      author: "James Park",
      description: "Discovering new ways to share ideas in the digital age.",
      category: "Creative",
    },
  ]);

  // Auto-scroll carousels
  useEffect(() => {
    if (!featuredApi) return;
    const interval = setInterval(() => featuredApi.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [featuredApi]);

  useEffect(() => {
    if (!storiesApi) return;
    const interval = setInterval(() => storiesApi.scrollNext(), 6000);
    return () => clearInterval(interval);
  }, [storiesApi]);

  useEffect(() => {
    if (!collectionsApi) return;
    const interval = setInterval(() => collectionsApi.scrollNext(), 6000);
    return () => clearInterval(interval);
  }, [collectionsApi]);

  useEffect(() => {
    if (!recommendationsApi) return;
    const interval = setInterval(() => recommendationsApi.scrollNext(), 6000);
    return () => clearInterval(interval);
  }, [recommendationsApi]);

  const handleStoryClick = async (storyId) => {
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
      navigate(`/stories/${storyId}`);
    } catch (err) {
      console.error("Failed to view story:", err);
    }
  };

  const handleCollectionClick = async (collectionId) => {
    try {
      await fetch(`https://fanhub-server.onrender.com/api/gallery/collections/${collectionId}/view`, {
        method: "POST",
        credentials: "include",
      });
      navigate(`/gallery/${collectionId}`);
    } catch (err) {
      console.error("Failed to view collection:", err);
    }
  };

  return (
    <div
      className="min-h-screen transition-colors duration-500"
      style={{
        backgroundColor: "var(--background-color)",
        color: "var(--foreground-color)",
      }}
    >
      {user && <NotificationsSetup user={user} />}

      {/* HEADER */}
      <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Spacer so content isn't hidden behind fixed navbar */}
      <div className="h-6"></div>

      {/* MAIN CONTENT */}
      <main className="px-4 py-10 md:px-8 pt-32 md:pt-36 transition-colors duration-500">
        {/* FEATURED SECTION */}
        <section className="mb-12 w-full max-w-7xl mx-auto">
          <Carousel setApi={setFeaturedApi} opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {featuredContent.map((item) => (
                <CarouselItem key={item.id} className="pl-2 md:pl-4">
                  <div
                    className="rounded-lg overflow-hidden p-[1px] transition-all duration-500"
                    style={{
                      background: "linear-gradient(135deg, #60a5fa, #a855f7, #ec4899)",
                    }}
                  >
                    <div
                      className="rounded-lg p-6 h-56 sm:h-64 flex flex-col justify-between"
                      style={{
                        backgroundColor: "var(--card-bg)",
                        color: "var(--card-text)",
                      }}
                    >
                      <div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full"
                              style={{
                                backgroundColor: darkMode ? "rgba(255,255,255,0.15)" : "rgba(59,130,246,0.15)",
                                color: "var(--button-bg)",
                              }}>
                          {item.category}
                        </span>
                        <h3 className="text-2xl font-bold mt-2 mb-1">{item.title}</h3>
                        <p className="text-sm opacity-80">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                          style={{
                            background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
                            color: "#fff",
                          }}
                        >
                          {item.author[0]}
                        </div>
                        <div>
                          <p className="text-xs opacity-70">Featured Writer</p>
                          <p className="font-semibold">{item.author}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex left-2 md:left-4" />
            <CarouselNext className="hidden sm:flex right-2 md:right-4" />
          </Carousel>
        </section>

        {/* STORIES SECTION */}
        {stories.length > 0 && (
          <section className="w-full max-w-7xl mx-auto mb-12">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2
                className="text-2xl md:text-3xl font-bold"
                style={{ color: "var(--foreground-color)" }}
              >
                Stories 📖
              </h2>
              <Link 
                to="/homestories" 
                className="text-sm font-medium hover:underline transition-all"
                style={{ color: "var(--button-bg)" }}
              >
                View All
              </Link>
            </div>

            <Carousel 
              setApi={setStoriesApi} 
              opts={{ align: "start", loop: true }} 
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {stories.map((story) => (
                  <CarouselItem 
                    key={story.id} 
                    className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                  >
                    <StoryCard story={story} onClick={handleStoryClick} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex left-2 md:left-4" />
              <CarouselNext className="hidden sm:flex right-2 md:right-4" />
            </Carousel>
          </section>
        )}

        {/* VISUAL STORIES (COLLECTIONS) SECTION */}
        {collections.length > 0 && (
          <section className="w-full max-w-7xl mx-auto mb-12">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2
                className="text-2xl md:text-3xl font-bold"
                style={{ color: "var(--foreground-color)" }}
              >
                Visual Stories 🎨
              </h2>
              <Link 
                to="/visual stories" 
                className="text-sm font-medium hover:underline transition-all"
                style={{ color: "var(--button-bg)" }}
              >
                View All
              </Link>
            </div>

            <Carousel 
              setApi={setCollectionsApi} 
              opts={{ align: "start", loop: true }} 
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {collections.map((collection) => (
                  <CarouselItem 
                    key={collection.id} 
                    className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                  >
                    <CollectionCard collection={collection} onClick={handleCollectionClick} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex left-2 md:left-4" />
              <CarouselNext className="hidden sm:flex right-2 md:right-4" />
            </Carousel>
          </section>
        )}

        {/* CURATED RECOMMENDATIONS SECTION */}
        {recommendations.length > 0 && (
          <section className="w-full max-w-7xl mx-auto mb-12">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2
                className="text-2xl md:text-3xl font-bold"
                style={{ color: "var(--foreground-color)" }}
              >
                Curated Reading Lists 📚
              </h2>
              <Link 
                to="/recommendations" 
                className="text-sm font-medium hover:underline transition-all"
                style={{ color: "var(--button-bg)" }}
              >
                View All
              </Link>
            </div>

            <Carousel 
              setApi={setRecommendationsApi} 
              opts={{ align: "start", loop: true }} 
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {recommendations.map((rec) => (
                  <CarouselItem 
                    key={rec.id} 
                    className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <RecommendationCard recommendation={rec} darkMode={darkMode} navigate={navigate} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex left-2 md:left-4" />
              <CarouselNext className="hidden sm:flex right-2 md:right-4" />
            </Carousel>
          </section>
        )}

        {/* TOP WRITERS */}
        {topWriters.length > 0 && (
          <section className="w-full max-w-7xl mx-auto">
            <h2
              className="text-2xl md:text-3xl font-bold mb-4 px-2"
              style={{ color: "var(--foreground-color)" }}
            >
              Top Writers of the Week to Follow ✨
            </h2>
  
            <div
              className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-1 md:px-2 snap-x snap-mandatory"
              style={{
                scrollBehavior: "smooth",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {topWriters.map((writer) => (
                <div key={writer.id} className="snap-start">
                  <TopWriterCard writer={writer} darkMode={darkMode} />
                </div>
              ))}
            </div>
          </section>
        )}
     
      </main>
    </div>
  );
};

// STORY CARD COMPONENT
function StoryCard({ story, onClick }) {
  return (
    <div
      className="group cursor-pointer rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95"
      onClick={() => onClick(story.id)}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-md">
        <img
          src={story.imgUrl}
          alt={`Cover for ${story.title}`}
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
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

      <div className="p-2">
        <h3 
          className="font-semibold text-sm line-clamp-2 leading-tight" 
          style={{ color: "var(--foreground-color)" }}
        >
          {story.title}
        </h3>
      </div>
    </div>
  );
}

// COLLECTION CARD COMPONENT
function CollectionCard({ collection, onClick }) {
  return (
    <div
      className="group cursor-pointer rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95"
      onClick={() => onClick(collection.id)}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-md">
        <img
          src={collection.img}
          alt={`Cover for ${collection.name}`}
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
          <div className="flex items-center justify-between text-white text-xs">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-blue-400" />
              {collection._count.views}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-400" />
              {collection._count.likes}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              {collection._count.review}
            </span>
          </div>
        </div>
      </div>

      <div className="p-2">
        <h3 
          className="font-semibold text-sm line-clamp-2 leading-tight" 
          style={{ color: "var(--foreground-color)" }}
        >
          {collection.name}
        </h3>
      </div>
    </div>
  );
}

// RECOMMENDATION CARD COMPONENT
function RecommendationCard({ recommendation, darkMode, navigate }) {
  const hasLiked = recommendation.likes?.length > 0;

  return (
    <div
      className="rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer group h-full"
      style={{
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--border-color)",
      }}
      onClick={() => navigate(`/recommendation/${recommendation.id}`)}
    >
      <div className="relative h-40 overflow-hidden">
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
                color: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)" 
              }} 
            />
          </div>
        )}
        
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

      <div className="p-4">
        <h3 
          className="font-bold text-lg mb-2 line-clamp-2 group-hover:underline"
          style={{ color: "var(--card-text)" }}
        >
          {recommendation.title}
        </h3>

        {recommendation.description && (
          <p className="text-sm opacity-70 mb-3 line-clamp-2">
            {recommendation.description}
          </p>
        )}

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

        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={recommendation.user?.img} alt={recommendation.user?.username} />
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

          <div className="flex items-center gap-3 text-xs opacity-70">
            <div className="flex items-center gap-1">
              <Heart size={14} fill={hasLiked ? "currentColor" : "none"} />
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

// TOP WRITER CARD
export function TopWriterCard({ writer }) {
  const { followed, loading, toggleFollow } = useFollow(
    writer.username,
    writer.id
  );
  const navigate = useNavigate();

  return (
    <div
      className="flex-shrink-0 w-36 md:w-44 rounded-lg p-3 transition-all duration-300 hover:shadow-lg"
      style={{
        backgroundColor: "var(--card-bg)",
        color: "var(--card-text)",
        border: "1px solid var(--border-color)",
      }}
    >
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-14 w-14 mb-2">
          <AvatarImage src={writer.img} alt={writer.username} />
          <AvatarFallback
            style={{
              backgroundColor: "var(--button-bg)",
              color: "var(--button-text)",
            }}
          >
            {writer.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <p
          className="font-semibold cursor-pointer hover:underline transition-all duration-300"
          style={{ color: "var(--card-text)" }}
          onClick={() =>
            navigate(`/profile/${writer.username}/${writer.id}/about`)
          }
        >
          {writer.username}
        </p>
        <p className="text-sm opacity-70">
          {writer.social.writingpoint} pts
        </p>
        <button
          onClick={toggleFollow}
          disabled={loading}
          className="mt-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 hover:opacity-90"
          style={{
            backgroundColor:
              followed === "Follow" ? "var(--button-bg)" : "transparent",
            color:
              followed === "Follow"
                ? "var(--button-text)"
                : "var(--card-text)",
            border:
              followed === "Follow"
                ? "none"
                : "1px solid var(--border-color)",
          }}
        >
          {loading ? "..." : followed}
        </button>
      </div>
    </div>
  );
}

export default App;
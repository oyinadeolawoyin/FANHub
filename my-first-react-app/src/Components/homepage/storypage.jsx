// storypage.jsx - Enhanced with accessibility and beautiful design
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import Header from "../css/header";
import { 
    Heart, 
    BookOpen, 
    Eye, 
    Star, 
    Clock, 
    User,
    BookMarked,
    Share2,
    ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AddToRecommendationList from "../recommendationList/recommendationModal";

function HomeStoryPage() {
    const { user } = useAuth();
    const { id } = useParams();
    const [story, setStory] = useState(null);
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [chaploading, setChapLoading] = useState(false);
    const [chapters, setChapters] = useState([]);
    const [libraryLoading, setLibraryLoading] = useState(false);
    const [libraryStatus, setLibraryStatus] = useState({}); 
    const [likeLoading, setLikeLoading] = useState(false);

    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem("theme");
        return saved ? saved === "dark" : false;
    });
    
    // Theme effect
    useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    useEffect(() => {
        async function fetchStory() {
            setError("");
            setLoading(true);
            try {
                const response = await fetch(`https://fanhub-server.onrender.com/api/stories/story/${id}`, {
                    method: "GET",
                    credentials: "include",
                });
        
                const data = await response.json();
                if (response.status === 500) {
                    navigate("/error", { state: { message: data.message || "Process failed" } });
                    return;
                } 
                if (!response.ok && response.status !== 500) {
                    setError(data.message); 
                    return;
                } 

                setStory(data.story);
                setLibraryStatus((prev) => ({
                    ...prev,
                    [data.story.id]: data.story.library?.length > 0,
                }));
                       
            } catch(err) {
                navigate("/error", { state: { message: err.message } });
            } finally {
                setLoading(false);
            }
        };

        fetchStory();
    }, [id, navigate]);

    useEffect(() => {
        setChapLoading(true);
        setError("");

        async function fetchChapters() {
            try {
                const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/chapters`, {
                    method: "GET",
                    credentials: "include",
                });
                
                const data = await response.json();
                
                if (response.status === 500) {
                    navigate("/error", { state: { message: data.message || "Process failed" } });
                    return;
                }
                if (!response.ok && response.status !== 500) {
                    setError(data.message); 
                    return;
                } 
        
                setChapters(data.chapters || []);
            } catch(err) {
                navigate("/error", { state: { message: err.message } });
            } finally {
                setChapLoading(false);
            }
        }
        fetchChapters();

    }, [id, navigate]);

    async function likeStory(e) {
        e.preventDefault();
        setError("");
        setLikeLoading(true);
      
        try {
          const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/like/love`, {
            method: "POST",
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
      
          setStory(prevStory => {
            const likesData = data.message === "Liked!" ? 1 : -1;
            const userLiked = data.message === "Liked!";
      
            return {
              ...prevStory,
              _count: {
                ...prevStory._count,
                likes: prevStory._count.likes + likesData,
              },
              likedByCurrentUser: userLiked,
            };
          });
      
          if (data.message === "Liked!") {
            await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/social/likepoint`, {
              method: "POST",
              credentials: "include",
            });
          }
      
        } catch(err) {
          navigate("/error", { state: { message: err.message } });
        } finally {
          setLikeLoading(false);
        }
    }

    async function addToLibrary(storyId) {
        setError("")
        setLibraryLoading(true);

        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${storyId}/library`, {
            method: "POST",
            credentials: "include",
            });

            const data = await response.json();
            
            if (response.status === 500) {
                navigate("/error", { state: { message: data.message || "Process failed" } });
                return;
            } 
            if (!response.ok && response.status !== 500) {
                setError(data.message); 
                return;
            }
            
            setLibraryStatus((prev) => ({
                ...prev,
                [storyId]: !prev[storyId],
            }));
            
        } catch(err) {
            navigate("/error", { state: { message: err.message } });
        } finally {
            setLibraryLoading(false);
        }
    }

    async function view(chapterId) {
        try {
            await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/chapters/${chapterId}/view`, {
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
      
        } catch(err) {
            navigate("/error", { state: { message: err.message } });
        } 
    }

    if (loading) {
        return (
            <>
                <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background-color)", paddingTop: "80px" }}>
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-300 dark:border-gray-700 rounded-full animate-spin mx-auto"></div>
                        <p className="text-lg" style={{ color: "var(--foreground-color)" }}>Loading story...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!story) {
        return (
            <>
                <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background-color)", paddingTop: "80px" }}>
                    <p style={{ color: "var(--foreground-color)" }}>Story not found</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
            <div className="min-h-screen" style={{ backgroundColor: "var(--background-color)", paddingTop: "80px" }}>
                {/* Error Alert */}
                {error && (
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 mb-4 mt-4">
                        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-lg p-4" role="alert">
                            <p className="text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                )}

                {/* Story Header Section */}
                <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Breadcrumb Navigation */}
                    <nav aria-label="Breadcrumb" className="mb-8">
                        <ol className="flex items-center space-x-2 text-sm" style={{ color: "var(--secondary-text)" }}>
                            <li>
                                <button 
                                    onClick={() => navigate('/homestories')}
                                    className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors"
                                    style={{ color: "var(--accent-color)" }}
                                >
                                    Stories
                                </button>
                            </li>
                            <li aria-hidden="true">/</li>
                            <li>
                                <span className="font-medium" style={{ color: "var(--foreground-color)" }}>
                                    {story.title}
                                </span>
                            </li>
                        </ol>
                    </nav>

                    <div className="grid lg:grid-cols-3 gap-8 mb-12">
                        {/* Left: Cover Image */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <img 
                                    src={story.imgUrl} 
                                    alt={`Cover art for ${story.title}`}
                                    className="w-full rounded-2xl shadow-2xl object-cover"
                                    style={{ 
                                        height: "450px",
                                        border: "3px solid var(--border-color)"
                                    }}
                                />
                                
                                {/* Action Buttons */}
                                <div className="mt-6 space-y-3">
                                    <Button
                                        onClick={likeStory}
                                        disabled={likeLoading}
                                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                        story.likedByCurrentUser ? 'ring-2' : ''
                                        }`}
                                        style={{
                                        backgroundColor: story.likedByCurrentUser ? "#ef4444" : "var(--button-bg)",
                                        color: "white"
                                        }}
                                        aria-label={story.likedByCurrentUser ? "Unlike story" : "Like story"}
                                    >
                                        <Heart className={`w-5 h-5 ${story.likedByCurrentUser ? 'fill-current' : ''}`} />
                                        <span className="font-semibold">
                                        {story.likedByCurrentUser ? "Liked" : "Like"} {story._count.likes}
                                        </span>
                                    </Button>

                                    <Button
                                        disabled={libraryLoading}
                                        onClick={() => addToLibrary(story.id)}
                                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                        style={{
                                        backgroundColor: libraryStatus[story.id] ? "#f59e0b" : "var(--card-bg)",
                                        color: libraryStatus[story.id] ? "white" : "var(--foreground-color)",
                                        border: `2px solid ${libraryStatus[story.id] ? "#f59e0b" : "var(--border-color)"}`
                                        }}
                                        aria-label={libraryStatus[story.id] ? "Remove from library" : "Add to library"}
                                    >
                                        <BookMarked className={`w-5 h-5 ${libraryStatus[story.id] ? 'fill-current' : ''}`} />
                                        <span className="font-semibold">
                                        {libraryLoading ? "Loading..." : libraryStatus[story.id] ? "In Library" : "Add to Library"}
                                        </span>
                                    </Button>

                                    {/* Add to Recommendation List Button */}
                                    <AddToRecommendationList storyId={story.id} />

                                    <Button
                                        onClick={() => navigate(`/stories/${story.id}/reviews`)}
                                        className="w-full flex items-center justify-center gap-2 py-4 rounded-xl transition-all hover:scale-105 active:scale-95"
                                        style={{
                                        backgroundColor: "var(--card-bg)",
                                        color: "var(--foreground-color)",
                                        border: "2px solid var(--border-color)"
                                        }}
                                        aria-label="View all reviews"
                                    >
                                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                        <span className="font-semibold">View All Reviews</span>
                                    </Button>
                                </div>

                                {/* Stats */}
                                <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2" style={{ color: "var(--secondary-text)" }}>
                                                <Eye className="w-4 h-4 text-blue-500" />
                                                Views
                                            </span>
                                            <span className="font-bold" style={{ color: "var(--foreground-color)" }}>
                                                {story._count.views.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2" style={{ color: "var(--secondary-text)" }}>
                                                <span className="text-xl">⭐</span>
                                                Reviews
                                            </span>
                                            <button
                                                onClick={() => navigate(`/stories/${story.id}/reviews`)}
                                                className="font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                                                style={{ color: "var(--accent-color)" }}
                                            >
                                                {story._count.reviews}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2" style={{ color: "var(--secondary-text)" }}>
                                                <BookOpen className="w-4 h-4 text-purple-500" />
                                                Chapters
                                            </span>
                                            <span className="font-bold" style={{ color: "var(--foreground-color)" }}>
                                                {chapters.length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Story Info */}
                        <div className="lg:col-span-2 space-y-8">
                            <header>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ color: "var(--foreground-color)" }}>
                                    {story.title}
                                </h1>
                                
                                <button
                                    onClick={() => navigate(`/profile/${story.user.username}/${story.userId}/about`)}
                                    className="flex items-center gap-3 text-lg mb-6 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-all"
                                    style={{ color: "var(--accent-color)" }}
                                    aria-label={`View profile of ${story.user.username}`}
                                >
                                    {story.user.img ? (
                                        <img 
                                            src={story.user.img} 
                                            alt={`${story.user.username}'s avatar`}
                                            className="w-10 h-10 rounded-full object-cover border-2"
                                            style={{ borderColor: "var(--accent-color)" }}
                                        />
                                    ) : (
                                        <div 
                                            className="w-10 h-10 rounded-full flex items-center justify-center border-2"
                                            style={{ 
                                                borderColor: "var(--accent-color)",
                                                backgroundColor: "var(--card-bg)"
                                            }}
                                        >
                                            <User className="w-5 h-5" style={{ color: "var(--accent-color)" }} />
                                        </div>
                                    )}
                                    <span className="font-medium">{story.user.username}</span>
                                </button>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)", color: "var(--foreground-color)" }}>
                                        {story.type}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)", color: "var(--foreground-color)" }}>
                                        {story.status}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)", color: "var(--foreground-color)" }}>
                                        {story.age}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)", color: "var(--foreground-color)" }}>
                                        {story.audience}
                                    </span>
                                </div>
                            </header>

                            {/* Synopsis */}
                            <section aria-labelledby="synopsis-heading">
                                <h2 id="synopsis-heading" className="text-2xl font-bold mb-4" style={{ color: "var(--foreground-color)" }}>
                                    Synopsis
                                </h2>
                                <p className="text-lg leading-relaxed" style={{ color: "var(--secondary-text)" }}>
                                    {story.summary}
                                </p>
                            </section>

                            {/* Genres */}
                            <section aria-labelledby="genres-heading" className="grid sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
                                    <h3 className="font-semibold mb-2" style={{ color: "var(--secondary-text)" }}>Primary Genre</h3>
                                    <p className="text-lg font-medium" style={{ color: "var(--foreground-color)" }}>{story.primarygenre}</p>
                                </div>
                                {story.secondarygenre && (
                                    <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
                                        <h3 className="font-semibold mb-2" style={{ color: "var(--secondary-text)" }}>Secondary Genre</h3>
                                        <p className="text-lg font-medium" style={{ color: "var(--foreground-color)" }}>{story.secondarygenre}</p>
                                    </div>
                                )}
                            </section>

                            {/* Subgenres */}
                            {(story.primarysubgenre.length > 0 || story.secondarysubgenre.length > 0) && (
                                <section aria-labelledby="subgenres-heading">
                                    <h2 id="subgenres-heading" className="text-xl font-bold mb-3" style={{ color: "var(--foreground-color)" }}>
                                        Subgenres
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {[...story.primarysubgenre, ...story.secondarysubgenre].map((subgenre, idx) => (
                                            <span 
                                                key={idx} 
                                                className="px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium"
                                                style={{ 
                                                    backgroundColor: "var(--accent-color)", 
                                                    color: "white",
                                                    opacity: 0.9
                                                }}
                                            >
                                                {subgenre}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Warnings */}
                            {story.warnings.length > 0 && (
                                <section aria-labelledby="warnings-heading" className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-300 dark:border-yellow-800">
                                    <h2 id="warnings-heading" className="text-lg font-bold mb-2 text-yellow-800 dark:text-yellow-400">
                                        Content Warnings
                                    </h2>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-500">
                                        {story.warnings.join(", ")}
                                    </p>
                                </section>
                            )}
                        </div>
                    </div>

                    {/* Chapters Section */}
                    <section aria-labelledby="chapters-heading" className="mt-12">
                        <h2 id="chapters-heading" className="text-3xl font-bold mb-6" style={{ color: "var(--foreground-color)" }}>
                            Chapters
                        </h2>
                        
                        {chaploading ? (
                            <div className="text-center py-12">
                                <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-300 dark:border-gray-700 rounded-full animate-spin mx-auto mb-4"></div>
                                <p style={{ color: "var(--secondary-text)" }}>Loading chapters...</p>
                            </div>
                        ) : chapters.length === 0 ? (
                            <div className="text-center py-12 p-8 rounded-xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
                                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: "var(--secondary-text)" }} />
                                <p className="text-lg" style={{ color: "var(--secondary-text)" }}>No chapters available yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {chapters.map((chapter, index) => (
                                    <button
                                        key={chapter.id}
                                        onClick={() => {
                                            view(chapter.id);
                                            navigate(`/stories/${story.id}/chapters/${chapter.id}`);
                                        }}
                                        className="w-full p-5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-left group"
                                        style={{
                                            backgroundColor: "var(--card-bg)",
                                            border: "2px solid var(--border-color)"
                                        }}
                                        aria-label={`Read chapter ${index + 1}: ${chapter.title}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: "var(--accent-color)", color: "white" }}>
                                                        Ch. {index + 1}
                                                    </span>
                                                    <h3 className="text-lg font-bold group-hover:underline" style={{ color: "var(--foreground-color)" }}>
                                                        {chapter.title}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm" style={{ color: "var(--secondary-text)" }}>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {new Date(chapter.uploadedAt).toLocaleDateString()}
                                                    </span>
                                                    {chapter.views && (
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="w-4 h-4" />
                                                            {chapter.views.toLocaleString()} views
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight className="w-6 h-6 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: "var(--accent-color)" }} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Write Review CTA */}
                    <section className="mt-16 mb-8">
                        <div
                            className="relative overflow-hidden rounded-2xl p-8 sm:p-12"
                            style={{
                                background: "linear-gradient(135deg, var(--accent-color) 0%, var(--button-bg) 100%)",
                                border: "2px solid var(--border-color)",
                            }}
                        >
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
                            
                            <div className="relative z-10 text-center max-w-2xl mx-auto">
                                <div className="flex justify-center mb-4">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className="w-8 h-8 sm:w-10 sm:h-10 fill-yellow-300 text-yellow-300 animate-pulse"
                                                style={{ animationDelay: `${i * 0.1}s` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                                    Enjoyed This Story?
                                </h2>
                                
                                <p className="text-white/90 text-base sm:text-lg mb-6 sm:mb-8">
                                    Share your experience and help other readers discover this amazing story
                                </p>
                                
                                <Button
                                    onClick={() => navigate(`/stories/${story.id}/review`)}
                                    className="bg-white hover:bg-gray-100 text-gray-900 font-bold py-4 px-8 rounded-xl text-base sm:text-lg transition-all hover:scale-105 active:scale-95 shadow-xl"
                                >
                                    Write a Review
                                </Button>
                            </div>
                        </div>
                    </section>
                </article>
            </div>
        </>
    );
}

export default HomeStoryPage;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import CommentList from "../comment/commentList";
import Header from "../css/header";
import { BookOpen, Eye, Clock, Heart, MessageSquare, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function HomeRecommendationPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [recommendation, setRecommendation] = useState(null);
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

    // Fetch recommendation
    useEffect(() => {
        setLoading(true);
        setError("");
    
        async function fetchRecommendation() {
            try {
                const response = await fetch(
                    `https://fanhub-server.onrender.com/api/recommendations/${id}`,
                    { method: "GET", credentials: "include" }
                );
                const data = await response.json();

                if (response.status === 500) {
                    navigate("/error", { state: { message: data.message || "Process failed" } });
                    return;
                }
                if (!response.ok) {
                    setError(data.message);
                    return;
                }

                setRecommendation(data.recommendation);
            } catch(err) {
                navigate("/error", { 
                    state: { message: "Network error: Please check your internet connection." } 
                });
            } finally {
                setLoading(false);
            }
        }
    
        fetchRecommendation();
    }, [id, navigate]);

    async function likeRecommendation(e) {
        e.preventDefault();
        if (likeLoading) return;
        
        setError("");
        setLikeLoading(true);

        try {
            const response = await fetch(
                `https://fanhub-server.onrender.com/api/recommendations/${id}/like`,
                { method: "POST", credentials: "include" }
            );
            const data = await response.json();

            if (response.status === 500) {
                navigate("/error", { state: { message: data.message || "Process failed" } });
                return;
            }
            if (!response.ok) {
                setError(data.message);
                return;
            }
            
            // Update recommendation state locally
            setRecommendation(prev => {
                const likesData = data.message === "Liked!" ? 1 : -1;
                const userLiked = data.message === "Liked!";
        
                return {
                    ...prev,
                    _count: {
                        ...prev._count,
                        likes: prev._count.likes + likesData,
                    },
                    likes: userLiked ? [{ id: data.likeId, userId: user.id }] : [],
                };
            });
        
            // If user liked, update social points
            if (data.message === "Liked!") {
                await fetch(
                    `https://fanhub-server.onrender.com/api/users/${user.id}/social/likepoint`,
                    { method: "POST", credentials: "include" }
                );
            }
        } catch(err) {
            navigate("/error", {
                state: { message: "Network error: Please check your internet connection." }
            });
        } finally {
            setLikeLoading(false);
        }
    }

    if (loading) {
        return (
            <>
                <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
                <div className="min-h-screen px-4 sm:px-6 lg:px-8 pt-32" style={{ backgroundColor: "var(--background-color)" }}>
                    {/* Skeleton for Header Image & Info */}
                    <div className="flex flex-col lg:flex-row gap-8 mb-12">
                        {/* Cover Image Skeleton */}
                        <Skeleton className="lg:w-1/3 h-72 rounded-2xl shadow-2xl" />
    
                        {/* Info Skeleton */}
                        <div className="flex-1 space-y-6">
                            <Skeleton className="h-12 w-3/4 rounded-lg" /> {/* Title */}
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-12 h-12 rounded-full" /> {/* Creator avatar */}
                                <Skeleton className="h-4 w-32 rounded" /> {/* Creator name */}
                            </div>
                            <Skeleton className="h-24 w-full rounded-xl" /> {/* Description */}
                            <div className="flex gap-4">
                                <Skeleton className="h-10 w-24 rounded-xl" /> {/* Like button */}
                                <Skeleton className="h-10 w-24 rounded-xl" /> {/* Another button */}
                            </div>
                        </div>
                    </div>
    
                    {/* Skeleton for Stories Grid */}
                    <div className="mb-16">
                        <Skeleton className="h-8 w-1/3 mb-6" /> {/* Stories heading */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, idx) => (
                                <Skeleton key={idx} className="h-64 w-full rounded-2xl" />
                            ))}
                        </div>
                    </div>
    
                    {/* Skeleton for Comments Section */}
                    <div className="p-6 sm:p-8 rounded-2xl shadow-lg">
                        <Skeleton className="h-8 w-1/3 mb-6" /> {/* Comments heading */}
                        {[...Array(3)].map((_, idx) => (
                            <div key={idx} className="flex items-center gap-4 mb-4">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <Skeleton className="h-4 w-full rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    }    

    if (!recommendation) {
        return (
            <>
                <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background-color)", paddingTop: "80px" }}>
                    <p style={{ color: "var(--foreground-color)" }}>Recommendation list not found</p>
                </div>
            </>
        );
    }

    const userLiked = recommendation.likes && recommendation.likes.length > 0;
        
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

                {/* Recommendation Content */}
                <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Breadcrumb Navigation */}
                    <nav aria-label="Breadcrumb" className="mb-8">
                        <ol className="flex items-center space-x-2 text-sm" style={{ color: "var(--secondary-text)" }}>
                            <li>
                                <button 
                                    onClick={() => navigate('/recommendations')}
                                    className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors"
                                    style={{ color: "var(--accent-color)" }}
                                >
                                    Recommendations
                                </button>
                            </li>
                            <li aria-hidden="true">/</li>
                            <li>
                                <span className="font-medium" style={{ color: "var(--foreground-color)" }}>
                                    {recommendation.title}
                                </span>
                            </li>
                        </ol>
                    </nav>

                    {/* Header with Cover Image */}
                    <header className="mb-12">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Cover Image - INCREASED HEIGHT */}
                            {recommendation.coverImage && (
                                <div className="lg:w-1/3 flex-shrink-0">
                                    <img 
                                        src={recommendation.coverImage} 
                                        alt={recommendation.title}
                                        className="w-full rounded-2xl shadow-2xl object-cover"
                                        style={{ 
                                            height: "450px",
                                            border: "3px solid var(--border-color)"
                                        }}
                                    />
                                </div>
                            )}

                            {/* Header Info */}
                            <div className="flex-1 space-y-6">
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight" style={{ color: "var(--foreground-color)" }}>
                                    {recommendation.title}
                                </h1>

                                {/* Creator Info */}
                                <div 
                                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => navigate(`/profile/${recommendation.user.username}/${recommendation.userId}/about`)}
                                >
                                    {recommendation.user.img ? (
                                        <img 
                                            src={recommendation.user.img} 
                                            alt={recommendation.user.username}
                                            className="w-12 h-12 rounded-full object-cover border-2"
                                            style={{ borderColor: "var(--border-color)" }}
                                        />
                                    ) : (
                                        <div 
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                                            style={{ 
                                                backgroundColor: "var(--card-bg)",
                                                color: "var(--accent-color)",
                                                border: "2px solid var(--border-color)"
                                            }}
                                        >
                                            {recommendation.user.username[0].toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm" style={{ color: "var(--secondary-text)" }}>Curated by</p>
                                        <p className="font-semibold" style={{ color: "var(--accent-color)" }}>
                                            @{recommendation.user.username}
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                {recommendation.description && (
                                    <div 
                                        className="p-6 rounded-xl"
                                        style={{ 
                                            backgroundColor: "var(--card-bg)",
                                            border: "1px solid var(--border-color)"
                                        }}
                                    >
                                        <p className="text-lg leading-relaxed" style={{ color: "var(--foreground-color)" }}>
                                            {recommendation.description}
                                        </p>
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="flex items-center gap-6 flex-wrap text-sm" style={{ color: "var(--secondary-text)" }}>
                                    <span className="flex items-center gap-2">
                                        <BookOpen className="w-5 h-5" />
                                        <span className="font-semibold">{recommendation._count.stories || 0}</span> Stories
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5" />
                                        <span className="font-semibold">{recommendation._count.comments || 0}</span> Comments
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        {new Date(recommendation.createdAt).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-4 pt-4">
                                    <button
                                        onClick={likeRecommendation}
                                        disabled={likeLoading}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                                            userLiked ? 'ring-2' : ''
                                        }`}
                                        style={{
                                            backgroundColor: userLiked ? "#ef4444" : "var(--button-bg)",
                                            color: "white"
                                        }}
                                        aria-label={userLiked ? "Unlike this list" : "Like this list"}
                                    >
                                        <Heart 
                                            className={`w-5 h-5 transition-all ${userLiked ? 'fill-current' : ''}`}
                                        />
                                        <span className="font-semibold">
                                            {userLiked ? "Liked" : "Like"} ({recommendation._count.likes || 0})
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Stories Grid - INCREASED WIDTH */}
                    <section className="mb-16" aria-labelledby="stories-heading">
                        <h2 id="stories-heading" className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: "var(--foreground-color)" }}>
                            Stories in this List ({recommendation._count.stories || 0})
                        </h2>
                        
                        {recommendation.stories && recommendation.stories.length === 0 ? (
                            <div 
                                className="text-center py-16 rounded-2xl"
                                style={{ 
                                    backgroundColor: "var(--card-bg)",
                                    border: "1px solid var(--border-color)"
                                }}
                            >
                                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: "var(--secondary-text)" }} />
                                <p style={{ color: "var(--secondary-text)" }}>No stories in this list yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                {recommendation.stories.map(({ story }) => (
                                    <div 
                                        key={story.id}
                                        onClick={() => navigate(`/stories/${story.id}`)}
                                        className="group cursor-pointer rounded-2xl overflow-hidden shadow-lg transition-all hover:scale-105 hover:shadow-2xl"
                                        style={{ 
                                            backgroundColor: "var(--card-bg)",
                                            border: "2px solid var(--border-color)"
                                        }}
                                    >
                                        {/* Story Cover - SHORTENED FOR MOBILE */}
                                        {story.imgUrl && (
                                            <div className="relative overflow-hidden aspect-[2/3]">
                                                <img
                                                    src={story.imgUrl}
                                                    alt={story.title}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                />
                                                {story.status && (
                                                    <span 
                                                        className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg"
                                                        style={{
                                                            backgroundColor: story.status === "Completed" ? "#10b981" : "#f59e0b",
                                                            color: "white"
                                                        }}
                                                    >
                                                        {story.status}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Story Info */}
                                        <div className="p-4 space-y-2">
                                            <h3 className="font-bold text-base line-clamp-2 group-hover:underline" style={{ color: "var(--foreground-color)" }}>
                                                {story.title}
                                            </h3>
                                            
                                            {story.user && (
                                                <p className="text-xs flex items-center gap-1" style={{ color: "var(--secondary-text)" }}>
                                                    <User className="w-3 h-3" />
                                                    {story.user.username}
                                                </p>
                                            )}
                                            
                                            {/* Genres */}
                                            <div className="flex flex-wrap gap-1">
                                                {story.primarygenre && (
                                                    <span 
                                                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                                                        style={{ 
                                                            backgroundColor: "var(--accent-color)",
                                                            color: "white"
                                                        }}
                                                    >
                                                        {story.primarygenre}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Comments Section - MOVED TO BOTTOM AND ALWAYS VISIBLE */}
                    <section 
                        className="p-6 sm:p-8 rounded-2xl shadow-lg"
                        style={{
                            backgroundColor: "var(--card-bg)",
                            border: "2px solid var(--border-color)"
                        }}
                        aria-labelledby="comments-heading"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <MessageSquare className="w-6 h-6" style={{ color: "var(--accent-color)" }} />
                            <h2 id="comments-heading" className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--foreground-color)" }}>
                                Reader Comments ({recommendation._count.comments || 0})
                            </h2>
                        </div>
                        <CommentList 
                            recommendationId={recommendation.id}
                            contentOwnerId={recommendation.userId}
                        />
                    </section>
                </article>
            </div>
        </>
    );
}

export default HomeRecommendationPage;
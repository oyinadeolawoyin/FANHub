// chapterPage.jsx - Enhanced with accessibility and beautiful design
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import CommentList from "../comment/commentList";
import Header from "../css/header";
import { ChevronLeft, ChevronRight, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

function Chapter() {
    const { storyId, chapterId } = useParams();
    const { user } = useAuth();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [chapter, setChapter] = useState(null);
    const [allChapters, setAllChapters] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [reactionLoading, setReactionLoading] = useState(false);
    const [activeReaction, setActiveReaction] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);

    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem("theme");
        return saved ? saved === "dark" : false;
    });
    
    // Theme effect
    useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);
    

    // Fetch chapter and all chapters for navigation
    useEffect(() => {
        setLoading(true);
        setError("");
    
        async function fetchData() {
            try {
                // Fetch current chapter
                const chapterResponse = await fetch(
                    `https://fanhub-server.onrender.com/api/stories/${storyId}/chapters/${chapterId}`,
                    { method: "GET", credentials: "include" }
                );
                const chapterData = await chapterResponse.json();

                if (chapterResponse.status === 500) {
                    navigate("/error", { state: { message: chapterData.message || "Process failed" } });
                    return;
                }
                if (!chapterResponse.ok) {
                    setError(chapterData.message);
                    return;
                }

                setChapter(chapterData.chapter);

                // Fetch all chapters for navigation
                const chaptersResponse = await fetch(
                    `https://fanhub-server.onrender.com/api/stories/${storyId}/chapters`,
                    { method: "GET", credentials: "include" }
                );
                const chaptersData = await chaptersResponse.json();

                if (chaptersResponse.ok) {
                    const chapters = chaptersData.chapters || [];
                    setAllChapters(chapters);
                    const index = chapters.findIndex(ch => ch.id === chapterData.chapter.id);
                    setCurrentIndex(index);

                if (index >= 0) {
                    const chapterNumber = index + 1; // human readable (1-based)
                    const totalChapters = chapters.length;

                    // Check if user has reached a multiple of 10 (10, 20, 30...)
                    const isMilestone = chapterNumber % 10 === 0;

                    // Check if this is the last chapter
                    const isLastChapter = chapterNumber === totalChapters;

                    // Show modal if milestone or last chapter
                    if (isMilestone || isLastChapter) {
                      // Avoid repeating on page reload — track with localStorage
                      const key = `reviewPrompt-${storyId}-chapter-${chapterNumber}`;
                      if (!localStorage.getItem(key)) {
                        setTimeout(() => setShowReviewModal(true), 1500); // delay to appear nicely
                        localStorage.setItem(key, "shown");
                      }
                    }
                  }
                }

            } catch(err) {
                navigate("/error", { 
                    state: { message: "Network error: Please check your internet connection." } 
                });
            } finally {
                setLoading(false);
            }
        }
    
        fetchData();
    }, [storyId, chapterId, navigate]);    

    const reactions = [
        { key: "lovethis", emoji: "❤️", label: "Love this", color: "text-red-500" },
        { key: "funny", emoji: "😂", label: "Funny", color: "text-yellow-500" },
        { key: "suspenseful", emoji: "😱", label: "Suspenseful", color: "text-purple-500" },
        { key: "emotional", emoji: "😢", label: "Emotional", color: "text-blue-500" },
        { key: "profound", emoji: "🧠", label: "Profound", color: "text-indigo-500" },
        { key: "heartwarming", emoji: "🥰", label: "Heartwarming", color: "text-pink-500" },
        { key: "shocking", emoji: "🤯", label: "Shocking", color: "text-orange-500" },
        { key: "goodwriting", emoji: "✍️", label: "Good Writing", color: "text-green-500" },
        { key: "goodcharacters", emoji: "👥", label: "Good Characters", color: "text-teal-500" },
        { key: "compellingplot", emoji: "📚", label: "Compelling Plot", color: "text-cyan-500" },
        { key: "strongdialogue", emoji: "🗣️", label: "Strong Dialogue", color: "text-violet-500" },
        { key: "inspiring", emoji: "✨", label: "Inspiring", color: "text-yellow-400" }
    ];

    async function likeChapter(e, like) {
        e.preventDefault();
        if (reactionLoading) return;
        
        setError("");
        setReactionLoading(true);
        setActiveReaction(like);
      
        try {
            const response = await fetch(
                `https://fanhub-server.onrender.com/api/stories/${storyId}/chapters/${chapterId}/like/${like}`,
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
      
            setChapter((prev) => {
                const isLike = data.message === "Liked!";
                const change = isLike ? 1 : -1;
      
                return {
                    ...prev,
                    reactionCounts: {
                        ...prev.reactionCounts,
                        [like]: (prev.reactionCounts?.[like] || 0) + change,
                    },
                    likedByCurrentUser: isLike,
                };
            });
      
            if (data.message === "Liked!") {
                await fetch(
                    `https://fanhub-server.onrender.com/api/users/${user.id}/social/likepoint`,
                    { method: "POST", credentials: "include" }
                );
            }
        } catch (err) {
            navigate("/error", {
                state: { message: "Network error: Please check your internet connection." }
            });
        } finally {
            setReactionLoading(false);
            setActiveReaction(null);
        }
    }

    const navigateChapter = (direction) => {
        if (direction === "prev" && currentIndex > 0) {
            const prevChapter = allChapters[currentIndex - 1];
            navigate(`/stories/${storyId}/chapters/${prevChapter.id}`);
        } else if (direction === "next" && currentIndex < allChapters.length - 1) {
            const nextChapter = allChapters[currentIndex + 1];
            navigate(`/stories/${storyId}/chapters/${nextChapter.id}`);
        }
    };

    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex >= 0 && currentIndex < allChapters.length - 1;

    const handleReviewRedirect = () => {
      setShowReviewModal(false);
      navigate(`/stories/${storyId}/review`);
    };

    if (loading) {
        return (
            <>
                <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background-color)", paddingTop: "80px" }}>
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-300 dark:border-gray-700 rounded-full animate-spin mx-auto"></div>
                        <p className="text-lg" style={{ color: "var(--foreground-color)" }}>Loading chapter...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!chapter) {
        return (
            <>
                <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background-color)", paddingTop: "80px" }}>
                    <p style={{ color: "var(--foreground-color)" }}>Chapter not found</p>
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
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 mb-4 mt-4">
                        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-lg p-4" role="alert">
                            <p className="text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                )}

                {/* Chapter Content */}
                <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Breadcrumb Navigation */}
                    <nav aria-label="Breadcrumb" className="mb-8">
                        <ol className="flex items-center space-x-2 text-sm" style={{ color: "var(--secondary-text)" }}>
                            <li>
                                <button 
                                    onClick={() => navigate(`/stories/${storyId}`)}
                                    className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 transition-colors"
                                    style={{ color: "var(--accent-color)" }}
                                >
                                    Story
                                </button>
                            </li>
                            <li aria-hidden="true">/</li>
                            <li>
                                <span className="font-medium" style={{ color: "var(--foreground-color)" }}>
                                    Chapter {currentIndex + 1}
                                </span>
                            </li>
                        </ol>
                    </nav>

                    {/* Chapter Header */}
                    <header className="mb-12 text-center space-y-4">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight" style={{ color: "var(--foreground-color)" }}>
                            {chapter.title}
                        </h1>
                        <div className="flex items-center justify-center gap-4 flex-wrap text-sm" style={{ color: "var(--secondary-text)" }}>
                            <span className="flex items-center gap-1.5">
                                <Eye className="w-4 h-4" />
                                <span>{chapter.views || 0} views</span>
                            </span>
                            <span aria-hidden="true">•</span>
                            <time dateTime={chapter.uploadedAt} className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>
                                    {new Date(chapter.uploadedAt).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </span>
                            </time>
                        </div>
                    </header>

                    {/* Chapter Content - Quill formatted */}
                    <div 
                        className="chapter-content prose prose-lg dark:prose-invert max-w-none mb-16"
                        style={{ 
                            color: "var(--foreground-color)"
                        }}
                    >
                        <div 
                            dangerouslySetInnerHTML={{ __html: chapter.content }}
                            className="ql-editor"
                            style={{
                                padding: "2rem 0",
                                fontSize: "1.125rem",
                                lineHeight: "1.8",
                                fontFamily: "Georgia, serif"
                            }}
                        />
                    </div>

                    {/* Chapter Navigation */}
                    <nav 
                        className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 py-8 border-t border-b mb-12" 
                        style={{ borderColor: "var(--border-color)" }}
                        aria-label="Chapter navigation"
                    >
                        <Button
                            onClick={() => navigateChapter("prev")}
                            disabled={!hasPrevious}
                            className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            style={{
                                backgroundColor: hasPrevious ? "var(--button-bg)" : "var(--border-color)",
                                color: hasPrevious ? "var(--button-text)" : "var(--secondary-text)"
                            }}
                            aria-label={hasPrevious ? `Previous chapter: ${allChapters[currentIndex - 1]?.title}` : "No previous chapter"}
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <div className="flex flex-col items-start text-left">
                                <span className="text-xs opacity-75">Previous</span>
                                {hasPrevious && (
                                    <span className="text-sm font-medium hidden sm:block max-w-[200px] truncate">
                                        {allChapters[currentIndex - 1]?.title}
                                    </span>
                                )}
                            </div>
                        </Button>

                        <button
                            onClick={() => navigate(`/stories/${storyId}`)}
                            className="px-6 py-4 rounded-lg transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            style={{
                                backgroundColor: "var(--card-bg)",
                                color: "var(--foreground-color)",
                                border: "2px solid var(--border-color)"
                            }}
                            aria-label="View all chapters"
                        >
                            <span className="font-medium">All Chapters</span>
                        </button>

                        <Button
                            onClick={() => navigateChapter("next")}
                            disabled={!hasNext}
                            className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            style={{
                                backgroundColor: hasNext ? "var(--button-bg)" : "var(--border-color)",
                                color: hasNext ? "var(--button-text)" : "var(--secondary-text)"
                            }}
                            aria-label={hasNext ? `Next chapter: ${allChapters[currentIndex + 1]?.title}` : "No next chapter"}
                        >
                            <div className="flex flex-col items-end text-right">
                                <span className="text-xs opacity-75">Next</span>
                                {hasNext && (
                                    <span className="text-sm font-medium hidden sm:block max-w-[200px] truncate">
                                        {allChapters[currentIndex + 1]?.title}
                                    </span>
                                )}
                            </div>
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </nav>

                    {/* Reactions Section */}
                    <section className="mb-16" aria-labelledby="reactions-heading">
                        <h2 id="reactions-heading" className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: "var(--foreground-color)" }}>
                            How did you feel about this chapter?
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {reactions.map(({ key, emoji, label, color }) => (
                                <button
                                    key={key}
                                    onClick={(e) => likeChapter(e, key)}
                                    disabled={reactionLoading}
                                    className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                                        activeReaction === key ? 'ring-2' : ''
                                    }`}
                                    style={{
                                        backgroundColor: "var(--card-bg)",
                                        border: "2px solid var(--border-color)",
                                        color: "var(--foreground-color)"
                                    }}
                                    aria-label={`React with ${label}. Current count: ${chapter.reactionCounts?.[key] || 0}`}
                                    aria-pressed={activeReaction === key}
                                >
                                    <span className="text-2xl sm:text-3xl" role="img" aria-hidden="true">{emoji}</span>
                                    <span className="flex flex-col items-start text-left">
                                        <span className="text-xs sm:text-sm font-medium">{label}</span>
                                        <span className="text-lg font-bold" style={{ color: "var(--accent-color)" }}>
                                            {chapter.reactionCounts?.[key] || 0}
                                        </span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Comments Section */}
                    <section 
                        className="p-6 sm:p-8 rounded-2xl shadow-lg"
                        style={{
                            backgroundColor: "var(--card-bg)",
                            border: "1px solid var(--border-color)"
                        }}
                        aria-labelledby="comments-heading"
                    >
                        <h2 id="comments-heading" className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: "var(--foreground-color)" }}>
                            Readers' Comments
                        </h2>
                        <CommentList 
                            chapterId={chapter.id} 
                            storyId={storyId} 
                            contentOwnerId={chapter.userId}
                        />
                    </section>
                </article>

                {showReviewModal && (
                  <div 
                    className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                    role="dialog" 
                    aria-modal="true"
                  >
                    <div 
                      className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center mx-4 animate-fadeIn"
                      style={{ border: "1px solid var(--border-color)" }}
                    >
                      <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">
                        Enjoying the story?
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                        Your review means a lot to the writer! 🌟  
                        It helps them grow, gain more readers, and keeps their creative spark alive.  
                        Would you like to share your thoughts on this story?
                      </p>

                      <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button
                          onClick={handleReviewRedirect}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                        >
                          Write a Review
                        </Button>
                        <Button
                          onClick={() => setShowReviewModal(false)}
                          className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                        >
                          Maybe Later
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
            </div>
        </>
    );
}

export default Chapter;
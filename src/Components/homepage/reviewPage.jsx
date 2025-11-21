import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import Delete from "../delete/delete";
import Header from "../css/header";
import { Star, Heart, Trash2, Calendar, UserCircle, ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "../css/footer";

function SingleReview() {
    const { user } = useAuth();
    const { reviewId, name, id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [review, setReview] = useState(null);
    const [likeLoading, setLikeLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem("theme");
        return saved ? saved === "dark" : false;
    });

    useEffect(() => {
        async function fetchReview() {
            setLoading(true);
            setError("");
            try {
                // Simplified - only need reviewId
                const response = await fetch(`https://fanhub-server.onrender.com/api/review/${reviewId}`, {
                    method: "GET",
                    credentials: "include",
                });
           
                const data = await response.json();
                if (response.status === 500) {
                    navigate("/error", { state: { message: data.message || "Process failed" } });
                    return;
                } else if (response.status === 404) {
                    setError("Review not found");
                    return;
                } else {
                    if (!response.ok && response.status !== 500) {
                        setError(data.message); 
                        return;
                    }
                } 

                setReview(data.review);
            } catch (err) {
                navigate("/error", {
                    state: { message: "Network error: Please check your internet connection." },
                });
            } finally {
                setLoading(false);
            }
        }
        fetchReview();
    }, [reviewId, navigate]);

    async function likeReview(e) {
        e.preventDefault();
        setError("");
        setLikeLoading(true);

        try {
            const path = name === "stories"
                ? `https://fanhub-server.onrender.com/api/${name}/${id}/reviews/${reviewId}/like/love`
                : `https://fanhub-server.onrender.com/api/gallery/${name}/${id}/reviews/${reviewId}/like/love`;

            const response = await fetch(path, {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();
            if (response.status === 500) {
                navigate("/error", { state: { message: data.message || "Process failed" } });
                return;
            } else {
                if (!response.ok && response.status !== 500) {
                    setError(data.message); 
                    return;
                }
            } 

            setReview(prev => {
                const likesData = data.message === "Liked!" ? 1 : -1;
                return {
                    ...prev,
                    _count: {
                        ...prev._count,
                        likes: prev._count.likes + likesData,
                    },
                    likedByCurrentUser: data.message === "Liked!",
                };
            });
            
            if (data.message === "Liked!") {
                await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/social/likepoint`, {
                    method: "POST",
                    credentials: "include",
                });
            }
        } catch (err) {
            navigate("/error", {
                state: { message: "Network error: Please check your internet connection." },
            });
        } finally {
            setLikeLoading(false);
        }
    }

    async function handleDelete() {
        setDeleting(true);
        try {
            const message = name === "stories"
                ? await Delete(`https://fanhub-server.onrender.com/api/stories/${id}/reviews/${reviewId}`)
                : await Delete(`https://fanhub-server.onrender.com/api/gallery/collections/${id}/reviews/${reviewId}`);   
            
            // Navigate back after deletion
            if (name === "stories") {
                navigate(`/stories/${id}`);
            } else {
                navigate(`/gallery/${id}`);
            }
        } catch(err) {
            navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
        } finally {
            setDeleting(false);
        }
    }

    const renderStars = (rating) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-5 h-5 transition-colors ${
                            star <= rating 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300 dark:text-gray-600'
                        }`}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <>
                <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
                <div className="h-10"></div>
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background-color)", paddingTop: "100px" }}>
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-300 dark:border-gray-700 rounded-full animate-spin mx-auto"></div>
                        <p className="text-lg" style={{ color: "var(--foreground-color)" }}>Loading review...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!review && !loading) {
        return (
            <>
                <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
                <div className="h-10"></div>
                <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background-color)", paddingTop: "100px" }}>
                    <div className="text-center space-y-4">
                        <Star className="w-16 h-16 mx-auto opacity-20" style={{ color: "var(--secondary-text)" }} />
                        <p className="text-xl font-medium" style={{ color: "var(--foreground-color)" }}>
                            Review not found
                        </p>
                        <Button
                            onClick={() => navigate(-1)}
                            className="mt-4"
                            style={{
                                backgroundColor: "var(--button-bg)",
                                color: "var(--button-text)"
                            }}
                        >
                            Go Back
                        </Button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
            <div className="h-10"></div>
            <div className="min-h-screen py-8 px-4" style={{ backgroundColor: "var(--background-color)", paddingTop: "100px" }}>
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(`/stories/${review.storyId}`)}
                        className="flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-all hover:scale-105 active:scale-95"
                        style={{
                            color: "var(--accent-color)",
                            backgroundColor: "var(--card-bg)",
                            border: "1px solid var(--border-color)"
                        }}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-lg p-4 animate-fadeIn" role="alert">
                            <p className="text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Review Card */}
                    {review && (
                        <article
                            className="rounded-2xl shadow-lg p-6 sm:p-8 animate-fadeIn"
                            style={{
                                backgroundColor: "var(--card-bg)",
                                border: "1px solid var(--border-color)"
                            }}
                        >
                            {/* Review Header with User Info */}
                            <div className="flex items-start gap-4 mb-6">
                                {/* User Avatar */}
                                <div className="flex-shrink-0">
                                    {review.user?.img ? (
                                        <img 
                                            src={review.user.img} 
                                            alt={review.user.username}
                                            className="w-14 h-14 rounded-full object-cover border-2"
                                            style={{ borderColor: "var(--border-color)" }}
                                        />
                                    ) : (
                                        <div 
                                            className="w-14 h-14 rounded-full flex items-center justify-center border-2"
                                            style={{ 
                                                backgroundColor: "var(--accent-color)",
                                                borderColor: "var(--border-color)"
                                            }}
                                        >
                                            <UserCircle className="w-10 h-10 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* User Info and Title */}
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: "var(--foreground-color)" }}>
                                        {review.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "var(--secondary-text)" }}>
                                        <span className="font-medium text-base" style={{ color: "var(--accent-color)" }}
                                         onClick={() => navigate(`/profile/${review.user.username}/${review.userId}/about`)}
                                        >
                                            {review.user?.username || 'Anonymous User'}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(review.uploadedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Rating Section */}
                            <div className="mb-8 p-6 rounded-xl" style={{ backgroundColor: "rgba(37, 99, 235, 0.05)", border: "1px solid var(--border-color)" }}>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-base font-semibold" style={{ color: "var(--foreground-color)" }}>
                                        Overall Rating
                                    </span>
                                    <div className="flex items-center gap-3">
                                        {renderStars(review.overallrate)}
                                        <span className="text-xl font-bold" style={{ color: "var(--accent-color)" }}>
                                            {review.overallrate}/5
                                        </span>
                                    </div>
                                </div>

                                {name === "stories" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
                                        <div className="flex flex-col gap-2">
                                            <span className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--secondary-text)" }}>
                                                <BookOpen className="w-4 h-4" />
                                                Plot
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {renderStars(review.plotrate)}
                                                <span className="text-sm font-bold" style={{ color: "var(--foreground-color)" }}>
                                                    {review.plotrate}/5
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <span className="text-sm font-medium" style={{ color: "var(--secondary-text)" }}>
                                                Writing Style
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {renderStars(review.writingstylerate)}
                                                <span className="text-sm font-bold" style={{ color: "var(--foreground-color)" }}>
                                                    {review.writingstylerate}/5
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <span className="text-sm font-medium" style={{ color: "var(--secondary-text)" }}>
                                                Grammar
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {renderStars(review.grammarrate)}
                                                <span className="text-sm font-bold" style={{ color: "var(--foreground-color)" }}>
                                                    {review.grammarrate}/5
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Review Content */}
                            <div className="mb-8">
                                <h2 className="text-lg font-bold mb-4" style={{ color: "var(--foreground-color)" }}>
                                    Review
                                </h2>
                                <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: "var(--foreground-color)" }}>
                                    {review.content}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: "var(--border-color)" }}>
                                <Button
                                    onClick={likeReview}
                                    disabled={likeLoading}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all hover:scale-105 active:scale-95 ${
                                        review.likedByCurrentUser
                                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                    style={!review.likedByCurrentUser ? {
                                        color: "var(--foreground-color)"
                                    } : {}}
                                >
                                    <Heart 
                                        className={`w-5 h-5 transition-all ${
                                            review.likedByCurrentUser ? 'fill-current animate-ping-once' : ''
                                        } ${likeLoading ? 'animate-pulse' : ''}`}
                                    />
                                    <span className="font-medium">
                                        {review._count?.likes || 0}
                                    </span>
                                </Button>

                                {(user?.id === review.userId) && (
                                    <Button
                                        disabled={deleting}
                                        onClick={() => {
                                            const confirmed = window.confirm("Are you sure you want to delete this review?");
                                            if (confirmed) {
                                                handleDelete();
                                            }
                                        }}
                                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 transition-all hover:scale-105 active:scale-95"
                                    >
                                        {deleting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-t-red-600 border-red-300 rounded-full animate-spin"></div>
                                                <span>Deleting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                <span>Delete Review</span>
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </article>
                    )}
                </div>
            </div>

            {/* FOOTER */}
            <Footer />
        </>
    );
}

export default SingleReview;
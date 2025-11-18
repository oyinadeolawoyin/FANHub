import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import Delete from "../delete/delete";
import Header from "../css/header";
import SmartAvatar from "../utils/SmartAvatar";
import { Star, Heart, Trash2, Calendar, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast, useConfirm, Toast, ConfirmDialog } from "../utils/toast-modal";

function Reviews() {
    const { user } = useAuth();
    const { id, name } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [likeLoadingId, setLikeLoadingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Toast and Confirm hooks
    const { toast, showToast, closeToast } = useToast();
    const { confirm, showConfirm, closeConfirm } = useConfirm();

    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem("theme");
        return saved ? saved === "dark" : false;
    });

    useEffect(() => {
        async function fetchReviews() {
            setLoading(true);
            setError("");
            try {
                const path = name === "stories"
                    ? `https://fanhub-server.onrender.com/api/stories/${id}/reviews`
                    : `https://fanhub-server.onrender.com/api/gallery/collections/${id}/reviews`;

                const response = await fetch(path, {
                    method: "GET",
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

                setReviews(data.reviews || []);
            } catch (err) {
                navigate("/error", {
                    state: { message: "Network error: Please check your internet connection." },
                });
            } finally {
                setLoading(false);
            }
        }
        fetchReviews();
    }, [id, name, navigate]);

    async function likeReview(e, reviewId) {
        e.preventDefault();
        setError("");
        setLikeLoadingId(reviewId);

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

            setReviews(prev => prev.map(review => {
                if (review.id === reviewId) {
                    const likesData = data.message === "Liked!" ? 1 : -1;
                    return {
                        ...review,
                        _count: {
                            ...review._count,
                            likes: review._count.likes + likesData,
                        },
                        likedByCurrentUser: data.message === "Liked!",
                    };
                }
                return review;
            }));
            
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
            setLikeLoadingId(null);
        }
    }

    async function handleDelete(reviewId) {
        setDeletingId(reviewId);
        try {
            const message = name === "stories"
                ? await Delete(`https://fanhub-server.onrender.com/api/stories/${id}/reviews/${reviewId}`)
                : await Delete(`https://fanhub-server.onrender.com/api/gallery/collections/${id}/reviews/${reviewId}`);   
            
            showToast(message || "Review deleted successfully!", "success");
            setReviews(prev => prev.filter(r => Number(r.id) !== Number(reviewId)));
        } catch(err) {
            showToast("Failed to delete review. Please try again.", "error");
        } finally {
            setDeletingId(null);
        }
    }

    const renderStars = (rating) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 transition-colors ${
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
                        <p className="text-lg" style={{ color: "var(--foreground-color)" }}>Loading reviews...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
            <div className="h-10"></div>
            
            {/* Toast Notification */}
            <Toast 
                message={toast.message} 
                type={toast.type} 
                isOpen={toast.isOpen} 
                onClose={closeToast} 
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirm.isOpen}
                onClose={closeConfirm}
                onConfirm={confirm.onConfirm}
                title={confirm.title}
                description={confirm.description}
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />

            <div className="min-h-screen py-8 px-4" style={{ backgroundColor: "var(--background-color)", paddingTop: "100px" }}>
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <header className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: "var(--foreground-color)" }}>
                            Reader Reviews
                        </h1>
                        <p style={{ color: "var(--secondary-text)" }}>
                            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                        </p>
                    </header>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-lg p-4 animate-fadeIn" role="alert">
                            <p className="text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Reviews List */}
                    {reviews.length > 0 ? (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <article
                                    key={review.id}
                                    className="rounded-2xl shadow-lg p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-1 animate-fadeIn"
                                    style={{
                                        backgroundColor: "var(--card-bg)",
                                        border: "1px solid var(--border-color)"
                                    }}
                                >
                                    {/* Review Header with User Info */}
                                    <div className="flex items-start gap-4 mb-4">
                                        {/* User Avatar */}
                                        <div className="flex-shrink-0">
                                            {review.user?.img ? (
                                                <img 
                                                    src={review.user.img} 
                                                    alt={review.user.username}
                                                    className="w-12 h-12 rounded-full object-cover border-2"
                                                    style={{ borderColor: "var(--border-color)" }}
                                                />
                                            ) : (
                                                <div 
                                                    className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                                                    style={{ 
                                                        backgroundColor: "var(--accent-color)",
                                                        borderColor: "var(--border-color)"
                                                    }}
                                                >
                                                    <UserCircle className="w-8 h-8 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* User Info and Title */}
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: "var(--foreground-color)" }}>
                                                {review.title}
                                            </h2>
                                            <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "var(--secondary-text)" }}>
                                                <span className="font-medium cursor-pointer hover:underline" style={{ color: "var(--accent-color)" }}
                                                 onClick={() => navigate(`/profile/${review.user.username}/${review.userId}/about`)}
                                                >
                                                    {review.user?.username || 'Anonymous User'}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(review.uploadedAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rating Section */}
                                    <div className="mb-6 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium" style={{ color: "var(--secondary-text)" }}>
                                                Overall Rating:
                                            </span>
                                            {renderStars(review.overallrate)}
                                            <span className="text-sm font-bold" style={{ color: "var(--accent-color)" }}>
                                                {review.overallrate}/5
                                            </span>
                                        </div>

                                        {name === "stories" && (
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t" style={{ borderColor: "var(--border-color)" }}>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-medium" style={{ color: "var(--secondary-text)" }}>
                                                        Plot
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {renderStars(review.plotrate)}
                                                        <span className="text-xs font-semibold" style={{ color: "var(--foreground-color)" }}>
                                                            {review.plotrate}/5
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-medium" style={{ color: "var(--secondary-text)" }}>
                                                        Writing Style
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {renderStars(review.writingstylerate)}
                                                        <span className="text-xs font-semibold" style={{ color: "var(--foreground-color)" }}>
                                                            {review.writingstylerate}/5
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-medium" style={{ color: "var(--secondary-text)" }}>
                                                        Grammar
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {renderStars(review.grammarrate)}
                                                        <span className="text-xs font-semibold" style={{ color: "var(--foreground-color)" }}>
                                                            {review.grammarrate}/5
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Review Content */}
                                    <div className="mb-6">
                                        <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: "var(--foreground-color)" }}>
                                            {review.content}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
                                        <Button
                                            onClick={(e) => likeReview(e, review.id)}
                                            disabled={likeLoadingId === review.id}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105 active:scale-95 ${
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
                                                } ${likeLoadingId === review.id ? 'animate-pulse' : ''}`}
                                            />
                                            <span className="font-medium">
                                                {review._count.likes}
                                            </span>
                                        </Button>

                                        {(user?.id === review.userId) && (
                                            <Button
                                                disabled={deletingId === review.id}
                                                onClick={() => {
                                                    showConfirm(
                                                        "Delete Review",
                                                        "Are you sure you want to delete this review? This action cannot be undone.",
                                                        () => handleDelete(review.id)
                                                    );
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 transition-all hover:scale-105 active:scale-95"
                                            >
                                                {deletingId === review.id ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-t-red-600 border-red-300 rounded-full animate-spin"></div>
                                                        <span>Deleting...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trash2 className="w-4 h-4" />
                                                        <span>Delete</span>
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 rounded-2xl animate-fadeIn" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
                            <div className="mb-4">
                                <Star className="w-16 h-16 mx-auto opacity-20" style={{ color: "var(--secondary-text)" }} />
                            </div>
                            <p className="text-xl font-medium mb-2" style={{ color: "var(--foreground-color)" }}>
                                No reviews yet
                            </p>
                            <p style={{ color: "var(--secondary-text)" }}>
                                Be the first to share your thoughts!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Reviews;
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import { useToast } from "../utils/toast-modal";
import Header from "../css/header";
import { Star, Sparkles, BookOpen, Feather, CheckCircle2, AlertCircle } from "lucide-react";
import Footer from "../css/footer";

function WriteReview() {
    const [form, setForm] = useState({
        title: "",
        content: "",
        overallrate: "",
        grammarrate: "",
        plotrate: "",
        writingstylerate: ""
    });

    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { id, name } = useParams();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [hoveredRating, setHoveredRating] = useState({});

    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem("theme");
        return saved ? saved === "dark" : false;
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prevForm => ({
            ...prevForm,
            [name]: value
        }));
    }

    const handleRatingClick = (field, rating) => {
        setForm(prev => ({ ...prev, [field]: rating.toString() }));
    };

    async function handleSubmit(e) {
        setLoading(true);
        setError("");
        e.preventDefault();

        // Validation
        if (!form.overallrate || form.overallrate === "0") {
            setError("Please provide an overall rating");
            setLoading(false);
            return;
        }

        if (name === "stories" && (!form.plotrate || !form.grammarrate || !form.writingstylerate)) {
            setError("Please rate all story aspects");
            setLoading(false);
            return;
        }

        try {
            const path = name === "stories"
                ? `https://fanhub-server.onrender.com/api/stories/${id}/createreview`
                : `https://fanhub-server.onrender.com/api/gallery/collections/${id}/writeReview`;

            const response = await fetch(path, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
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

            const socialResponse = await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/social/reviewpoint`, {
                method: "POST",
                credentials: "include",
            });

            if (!socialResponse.ok) {
                const errData = await socialResponse.json();
                setError(errData.message || "Something is wrong. Try again!");
                return;
            }
            showToast("Review created!", "success");
            if (name === "stories") {
                navigate(`/stories/${id}`);
            } else {
                navigate(`/gallery/${id}`);
            }
        } catch (err) {
            navigate("/error", {
                state: { message: "Network error: Please check your internet connection." },
            });
        } finally {
            setLoading(false);
        }
    }

    const renderStarRating = (field, label, icon) => {
        const currentRating = parseInt(form[field]) || 0;
        const hovered = hoveredRating[field] || 0;
        const displayRating = hovered || currentRating;

        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                    {icon}
                    <label className="text-sm font-medium" style={{ color: "var(--foreground-color)" }}>
                        {label}
                    </label>
                    {currentRating > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
                            backgroundColor: "var(--accent-color)",
                            color: "white"
                        }}>
                            {currentRating}/5
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingClick(field, star)}
                            onMouseEnter={() => setHoveredRating(prev => ({ ...prev, [field]: star }))}
                            onMouseLeave={() => setHoveredRating(prev => ({ ...prev, [field]: 0 }))}
                            className="transition-all duration-200 hover:scale-125 active:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                            aria-label={`Rate ${star} stars`}
                        >
                            <Star
                                className={`w-8 h-8 sm:w-10 sm:h-10 transition-all duration-200 ${star <= displayRating
                                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                                        : 'text-gray-300 dark:text-gray-600'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
            <div className="h-10"></div>
            <div className="min-h-screen py-8 px-4" style={{ backgroundColor: "var(--background-color)", paddingTop: "100px" }}>
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <header className="text-center mb-8 space-y-3 animate-fadeIn">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: "rgba(37, 99, 235, 0.1)" }}>
                            <Sparkles className="w-8 h-8" style={{ color: "var(--accent-color)" }} />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: "var(--foreground-color)" }}>
                            Share Your Review
                        </h1>
                        <p className="text-base sm:text-lg" style={{ color: "var(--secondary-text)" }}>
                            Your feedback helps the creator grow and inspires other readers
                        </p>
                    </header>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 rounded-xl p-4 animate-fadeIn flex items-start gap-3" role="alert">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Review Title */}
                    <div className="mb-6 rounded-2xl p-6 sm:p-8 shadow-lg animate-fadeIn" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
                        <label className="block mb-3">
                            <span className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--foreground-color)" }}>
                                <Feather className="w-5 h-5" style={{ color: "var(--accent-color)" }} />
                                Review Title
                            </span>
                            <span className="text-sm" style={{ color: "var(--secondary-text)" }}>
                                Give your review a catchy title
                            </span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g., 'An Unforgettable Journey!' or 'Couldn't Put It Down'"
                            className="w-full px-4 py-3 rounded-xl text-base transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            style={{
                                backgroundColor: "var(--input-bg)",
                                color: "var(--input-text)",
                                border: "2px solid var(--border-color)"
                            }}
                        />
                    </div>

                    {/* Overall Rating */}
                    <div className="mb-6 rounded-2xl p-6 sm:p-8 shadow-lg animate-fadeIn" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
                        <div className="mb-4">
                            <h2 className="text-xl font-bold mb-1" style={{ color: "var(--foreground-color)" }}>
                                Overall Rating
                            </h2>
                            <p className="text-sm" style={{ color: "var(--secondary-text)" }}>
                                How would you rate this overall?
                            </p>
                        </div>
                        {renderStarRating("overallrate", "Your Rating",
                            <Star className="w-5 h-5" style={{ color: "var(--accent-color)" }} />
                        )}
                    </div>

                    {/* Story-Specific Ratings */}
                    {name === "stories" && (
                        <div className="mb-6 rounded-2xl p-6 sm:p-8 shadow-lg space-y-6 animate-fadeIn" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
                            <div className="mb-2">
                                <h2 className="text-xl font-bold mb-1" style={{ color: "var(--foreground-color)" }}>
                                    Detailed Ratings
                                </h2>
                                <p className="text-sm" style={{ color: "var(--secondary-text)" }}>
                                    Rate specific aspects of the story
                                </p>
                            </div>

                            {renderStarRating("plotrate", "Plot & Storyline",
                                <BookOpen className="w-5 h-5 text-purple-500" />
                            )}

                            <div className="border-t pt-6" style={{ borderColor: "var(--border-color)" }}>
                                {renderStarRating("writingstylerate", "Writing Style",
                                    <Feather className="w-5 h-5 text-blue-500" />
                                )}
                            </div>

                            <div className="border-t pt-6" style={{ borderColor: "var(--border-color)" }}>
                                {renderStarRating("grammarrate", "Grammar & Language",
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Review Content */}
                    <div className="mb-6 rounded-2xl p-6 sm:p-8 shadow-lg animate-fadeIn" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
                        <label className="block mb-3">
                            <span className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--foreground-color)" }}>
                                <Sparkles className="w-5 h-5" style={{ color: "var(--accent-color)" }} />
                                Your Thoughts
                            </span>
                            <span className="text-sm" style={{ color: "var(--secondary-text)" }}>
                                Share what you loved, what could be improved, and why others should read this
                            </span>
                        </label>
                        <textarea
                            name="content"
                            value={form.content}
                            onChange={handleChange}
                            required
                            rows={8}
                            placeholder="Share your honest thoughts... What did you love? What stood out? What could be better? Your feedback helps the author improve and helps other readers decide if this is for them."
                            className="w-full px-4 py-3 rounded-xl text-base transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 resize-none"
                            style={{
                                backgroundColor: "var(--input-bg)",
                                color: "var(--input-text)",
                                border: "2px solid var(--border-color)",
                                lineHeight: "1.6"
                            }}
                        />
                        <div className="mt-2 text-xs" style={{ color: "var(--secondary-text)" }}>
                            {form.content.length} characters
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fadeIn">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 py-4 px-6 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            style={{
                                backgroundColor: "var(--button-bg)",
                                color: "var(--button-text)"
                            }}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-3 border-t-white border-gray-300 rounded-full animate-spin"></div>
                                    Publishing Review...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Publish Review
                                </span>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                const confirmed = window.confirm("Are you sure? Your review will not be saved.");
                                if (confirmed) {
                                    if (name === "stories") {
                                        navigate(`/stories/${id}`);
                                    } else {
                                        navigate(`/gallery/${id}`);
                                    }
                                }
                            }}
                            disabled={loading}
                            className="sm:w-auto px-6 py-4 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: "var(--card-bg)",
                                color: "var(--foreground-color)",
                                border: "2px solid var(--border-color)"
                            }}
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Tips Section */}
                    <div className="mt-8 rounded-2xl p-6 animate-fadeIn" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border-color)" }}>
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: "var(--foreground-color)" }}>
                            <Sparkles className="w-5 h-5" style={{ color: "var(--accent-color)" }} />
                            Tips for a Great Review
                        </h3>
                        <ul className="space-y-2 text-sm" style={{ color: "var(--secondary-text)" }}>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>Be specific about what you liked or didn't like</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>Mention your favorite moments or characters</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>Keep it constructive and respectful</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>Avoid major spoilers to respect other readers</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <Footer />
        </>
    );
}

export default WriteReview;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, Heart, MessageSquare, Trash2, Edit, Plus, BookOpen, Clock, AlertTriangle, Library, ExternalLink } from "lucide-react";
import Delete from "../delete/delete";
import { Toast, useToast, ConfirmDialog, useConfirm } from "../utils/toast-modal";

function StoryPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [story, setStory] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [chapterLoading, setChapterLoading] = useState(false);
    const [chapters, setChapters] = useState([]);
    const [deletingId, setDeletingId] = useState(null);
    
    const { toast, showToast, closeToast } = useToast();
    const { confirm, showConfirm, closeConfirm } = useConfirm();
    
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
                } else {
                    if (!response.ok && response.status !== 500) {
                        setError(data.message); 
                        return;
                    }
                } 

                setStory(data.story);
            } catch(err) {
                navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
            } finally {
                setLoading(false);
            }
        };

        fetchStory();
    }, [id]);

    useEffect(() => {
        setChapterLoading(true);
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
                } else {
                    if (!response.ok && response.status !== 500) {
                        setError(data.message); 
                        return;
                    }
                } 
                
                setChapters(data.chapters);
            } catch(err) {
                navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
            } finally {
                setChapterLoading(false);
            }
        }
        fetchChapters();
    }, [id]);

    async function handleDelete(chapterId) {
        setDeletingId(chapterId);
        try {
            const message = await Delete(`https://fanhub-server.onrender.com/api/stories/${story.id}/chapters/${chapterId}`);
            showToast(message || "Chapter deleted successfully", "success");
            setChapters(prev => prev.filter(s => Number(s.id) !== Number(chapterId)))
        } catch(err) {
            showToast("Failed to delete chapter", "error");
        } finally {
            setDeletingId(null);
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-theme p-3 sm:p-4 md:p-6">
            <Toast
                message={toast.message}
                type={toast.type}
                isOpen={toast.isOpen}
                onClose={closeToast}
            />
            
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
            
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-12 sm:py-20">
                        <div className="flex flex-col items-center gap-3 sm:gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm sm:text-base text-secondary">Loading story...</p>
                        </div>
                    </div>
                ) : (
                    <div>
                        {story && (
                            <div>
                                {/* Header Section */}
                                <div className="card mb-6 sm:mb-8 shadow-sm">
                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                        {/* Story Cover */}
                                        <div className="flex-shrink-0 mx-auto sm:mx-0">
                                            <div className="w-48 h-64 sm:w-56 sm:h-80 rounded-2xl overflow-hidden bg-secondary shadow-lg">
                                                <img 
                                                    src={story.imgUrl} 
                                                    alt={story.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>

                                        {/* Story Details */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3 sm:mb-4">
                                                <div>
                                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-2">
                                                        {story.title}
                                                    </h1>
                                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                        <span className="px-2 sm:px-3 py-1 bg-primary/20 text-primary rounded-lg text-xs sm:text-sm font-medium">
                                                            {story.type}
                                                        </span>
                                                        <span className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium ${
                                                            story.status === 'PUBLISHED' 
                                                                ? 'bg-green-500/20 text-green-400' 
                                                                : story.status === 'ONGOING'
                                                                ? 'bg-blue-500/20 text-blue-400'
                                                                : 'bg-yellow-500/20 text-yellow-400'
                                                        }`}>
                                                            {story.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-secondary text-sm sm:text-base md:text-lg mb-4 sm:mb-6 leading-relaxed">
                                                {story.summary}
                                            </p>

                                            {/* Genres */}
                                            <div className="mb-4">
                                                <p className="text-xs text-secondary mb-2">GENRES</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-primary/20 text-primary rounded-lg text-xs sm:text-sm font-medium">
                                                        {story.primarygenre}
                                                    </span>
                                                    {story.secondarygenre && (
                                                        <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-accent/20 text-accent rounded-lg text-xs sm:text-sm font-medium">
                                                            {story.secondarygenre}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Subgenres */}
                                            <div className="mb-4">
                                                <p className="text-xs text-secondary mb-2">SUBGENRES</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {story.primarysubgenre?.map((subgenre, i) => (
                                                        <span key={i} className="px-2 py-1 bg-secondary rounded-md text-xs text-theme">
                                                            {subgenre}
                                                        </span>
                                                    ))}
                                                    {story.secondarysubgenre?.map((subgenre, i) => (
                                                        <span key={i} className="px-2 py-1 bg-secondary rounded-md text-xs text-theme">
                                                            {subgenre}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Warnings */}
                                            {story.warnings?.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-xs text-secondary mb-2">CONTENT WARNINGS</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {story.warnings.map((warning, i) => (
                                                            <span key={i} className="px-2 py-1 bg-destructive/20 text-destructive rounded-md text-xs flex items-center gap-1">
                                                                <AlertTriangle className="w-3 h-3" />
                                                                {warning}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Audience & Age */}
                                            <div className="flex gap-2 mb-4 sm:mb-6 flex-wrap">
                                                <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-secondary rounded-lg text-xs sm:text-sm text-theme">
                                                    {story.audience}
                                                </span>
                                                <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-secondary rounded-lg text-xs sm:text-sm text-theme">
                                                    {story.age}
                                                </span>
                                            </div>

                                            {/* Statistics */}
                                             <div className="mt-6 pt-6 border-t border-theme">
                                                <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                                                    <Eye className="w-5 h-5 text-blue-400" />
                                                    <div>
                                                    <p className="text-xs text-secondary">Views</p>
                                                    <p className="text-lg font-bold text-theme">
                                                        {story._count.views}
                                                    </p>
                                                    </div>
                                                </div>
                            
                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                                                    <Heart className="w-5 h-5 text-red-400" />
                                                    <div>
                                                    <p className="text-xs text-secondary">Likes</p>
                                                    <p className="text-lg font-bold text-theme">
                                                        {story._count.likes}
                                                    </p>
                                                    </div>
                                                </div>
                            
                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                                                    <MessageSquare className="w-5 h-5 text-green-400" />
                                                    <div>
                                                    <p className="text-xs text-secondary">Reviews</p>
                                                    <p className="text-lg font-bold text-theme">
                                                        {story._count.review?.toLocaleString()}
                                                    </p>
                                                    </div>
                                                </div>
                            
                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                                                    <Library className="w-5 h-5 text-purple-400" />
                                                    <div>
                                                    <p className="text-xs text-secondary">Library</p>
                                                    <p className="text-lg font-bold text-theme">
                                                        {story._count.library}
                                                    </p>
                                                    </div>
                                                </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Chapters Section */}
                                <main>
                                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                            <h2 className="text-xl sm:text-2xl font-bold text-theme">Chapters</h2>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/dashboard/story/${story.id}/create chapter`)}
                                            className="btn flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4"
                                        >
                                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            <span className="hidden xs:inline">New Chapter</span>
                                            <span className="xs:hidden">New</span>
                                        </button>
                                    </div>

                                    {chapterLoading ? (
                                        <div className="flex items-center justify-center py-8 sm:py-12">
                                            <div className="flex flex-col items-center gap-3 sm:gap-4">
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-secondary text-xs sm:text-sm">Loading chapters...</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            {chapters.length > 0 ? (
                                                <div className="space-y-3 sm:space-y-4">
                                                    {chapters.map(chapter => (
                                                        <div key={chapter.id} className="card group shadow-sm">
                                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                                                <div className="flex-1">
                                                                    <h3 className="text-base sm:text-lg font-bold text-theme mb-2">
                                                                        {chapter.title}
                                                                    </h3>
                                                                    
                                                                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-secondary mb-3">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                            <span>{formatDate(chapter.uploadedAt)}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                                                                            <span>{chapter._count.views}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                                                                            <span>{chapter._count.likes}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
                                                                            <span>{chapter._count.comments}</span>
                                                                        </div>
                                                                    </div>

                                                                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                                                                        chapter.status === 'PUBLISHED' 
                                                                            ? 'bg-green-500/20 text-green-400' 
                                                                            : 'bg-yellow-500/20 text-yellow-400'
                                                                    }`}>
                                                                        {chapter.status}
                                                                    </span>
                                                                </div>

                                                                {/* Action Buttons */}
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => navigate(`/stories/${story.id}/chapters/${chapter.id}`)}
                                                                        className="px-3 sm:px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-all duration-300 flex items-center gap-1.5"
                                                                        title="Preview Chapter"
                                                                    >
                                                                        <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                        <span className="hidden sm:inline text-xs">Preview</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => navigate(`/dashboard/story/${story.id}/update chapter/${chapter.id}`)}
                                                                        className="px-3 sm:px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-all duration-300"
                                                                        title="Edit Chapter"
                                                                    >
                                                                        <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-theme" />
                                                                    </button>
                                                                    <button
                                                                        disabled={deletingId === chapter.id}
                                                                        onClick={() => {
                                                                            showConfirm(
                                                                                "Delete Chapter",
                                                                                `Are you sure you want to delete "${chapter.title}"? This action cannot be undone.`,
                                                                                () => handleDelete(chapter.id)
                                                                            );
                                                                        }}
                                                                        className="px-3 sm:px-4 py-2 bg-destructive/20 hover:bg-destructive/30 rounded-lg transition-all duration-300 disabled:opacity-50"
                                                                        title="Delete Chapter"
                                                                    >
                                                                        {deletingId === chapter.id ? (
                                                                            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin"></div>
                                                                        ) : (
                                                                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="card text-center py-12 sm:py-20">
                                                    <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-secondary opacity-50" />
                                                    <p className="text-base sm:text-lg text-secondary mb-2">No chapters yet</p>
                                                    <p className="text-xs sm:text-sm text-secondary mb-4 sm:mb-6">Start writing your first chapter</p>
                                                    <button 
                                                        onClick={() => navigate(`/dashboard/story/${story.id}/create chapter`)}
                                                        className="btn inline-flex items-center gap-2 text-xs sm:text-sm"
                                                    >
                                                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        Create First Chapter
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </main>
                            </div>
                        )}
                    </div>
                )}
                
                {error && (
                    <div className="card bg-destructive/10 border-destructive/30 mt-4 sm:mt-6">
                        <p className="text-destructive text-center text-sm sm:text-base">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StoryPage;
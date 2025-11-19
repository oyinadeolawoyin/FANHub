import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Eye, Heart, MessageSquare, Trash2, Edit, Image, Library, Plus, EyeOff } from "lucide-react";
import { Toast, ConfirmDialog, WarningDialog, useToast, useConfirm, useWarning } from "../utils/toast-modal";
import { Button } from "@/components/ui/button";
import Delete from "../delete/delete";

function Collections() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [collections, setCollections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [publishingId, setPublishingId] = useState(null);
  const [error, setError] = useState("");
  const { toast, showToast, closeToast } = useToast();
  const { confirm, showConfirm, closeConfirm } = useConfirm();
  const { warning, showWarning, closeWarning } = useWarning();
  
  useEffect(() => {
    async function fetchCollections() {
      setError("");
      setLoading(true);
      try {
        const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/collections/${id}`, {
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
        setCollections(data.collections);
      } catch (err) {
        navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [id]);

  async function handleDelete(collectionId) {
    setDeletingId(collectionId);
    try {
      const message = await Delete(`https://fanhub-server.onrender.com/api/gallery/collections/${collectionId}`);
      setCollections(prev => prev.filter(s => Number(s.id) !== Number(collectionId)));
      showToast(message || 'Collection deleted successfully', 'success');
    } catch(err) {
      showToast('Failed to delete collection', 'error');
    } finally {
      setDeletingId(null);
    }
  }

  // ✅ NEW: Toggle publish status
  const togglePublish = async (collectionId, currentStatus) => {
    const collection = collections.find(c => c.id === collectionId);
    
    // Validate: Check if collection has at least one image or video before publishing
    const totalMedia = (collection._count?.images || 0) + (collection._count?.videos || 0);
    if (!currentStatus && totalMedia === 0) {
      showWarning(
        'Cannot Publish Collection',
        'Please add at least one image or video to your collection before publishing it. Your audience is waiting to see your work!'
      );
      return;
    }

    setPublishingId(collectionId);
    try {
      const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/collections/${collectionId}/publish`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (response.ok) {
        showToast(
          currentStatus ? 'Collection unpublished successfully' : 'Collection published successfully',
          'success'
        );
        // Update local state
        setCollections(prev => prev.map(c => 
          c.id === collectionId ? { ...c, isPublished: !currentStatus } : c
        ));
      } else {
        showToast('Failed to update publish status', 'error');
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      showToast('An error occurred while updating publish status', 'error');
    } finally {
      setPublishingId(null);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-theme border-theme">
      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${color}`} />
      <div className="flex flex-col">
        <span className="text-[10px] sm:text-xs text-secondary">{label}</span>
        <span className="text-xs sm:text-sm font-semibold text-theme">{value?.toLocaleString() || 0}</span>
      </div>
    </div>
  );

  return (
    <>
      <Toast {...toast} onClose={closeToast} />
      <ConfirmDialog
        {...confirm}
        onClose={closeConfirm}
        confirmText="Delete"
        cancelText="Cancel"
      />
      <WarningDialog
        {...warning}
        onClose={closeWarning}
      />
      
      <div className="min-h-screen bg-theme p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-1 sm:mb-2">Visual Stories</h1>
              <p className="text-sm sm:text-base text-secondary">Manage your gallery collections</p>
            </div>
            <Button 
              onClick={() => navigate('/dashboard/create collection')}
              className="btn flex items-center gap-2"
              aria-label="Create new collection"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Add New Collection</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 sm:py-20">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm sm:text-base text-secondary">Loading collections...</p>
              </div>
            </div>
          ) : (
            <div>
              {collections && (
                <div>
                  {collections.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {collections.map((collection) => (
                        <div key={collection.id} className="card group shadow-sm">
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            {/* Collection Image */}
                            <div className="flex-shrink-0 mx-auto sm:mx-0">
                              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-secondary">
                                <img 
                                  src={collection.img}
                                  alt={collection.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                {/* ✅ NEW: Published/Draft Badge */}
                                <div className="absolute top-2 right-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    collection.isPublished
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gray-500 text-white'
                                  }`}>
                                    {collection.isPublished ? 'Published' : 'Draft'}
                                  </span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </div>
                            </div>

                            {/* Collection Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="text-lg sm:text-xl font-bold text-theme truncate">{collection.name}</h3>
                                <span className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                                  collection.status === 'PUBLISHED' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {collection.status}
                                </span>
                              </div>

                              <p className="text-secondary text-xs sm:text-sm mb-3 line-clamp-2">{collection.description}</p>

                              {/* Genres */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                <span className="px-2 py-1 bg-primary/20 text-primary rounded-md text-xs font-medium">
                                  {collection.primarygenre}
                                </span>
                                <span className="px-2 py-1 bg-accent/20 text-accent rounded-md text-xs font-medium">
                                  {collection.secondarygenre}
                                </span>
                              </div>

                              {/* Audience & Age */}
                              <div className="flex gap-2 mb-3 sm:mb-4 flex-wrap">
                                <span className="px-2 py-1 bg-secondary rounded-md text-xs text-secondary">
                                  {collection.audience}
                                </span>
                                <span className="px-2 py-1 bg-secondary rounded-md text-xs text-secondary">
                                  {collection.age}
                                </span>
                              </div>

                              {/* Statistics */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 sm:mb-4">
                                <StatCard 
                                  icon={Eye} 
                                  label="Views" 
                                  value={collection._count?.views || 0} 
                                  color="text-blue-400"
                                />
                                <StatCard 
                                  icon={Heart} 
                                  label="Likes" 
                                  value={collection._count?.likes || 0} 
                                  color="text-red-400"
                                />
                                <StatCard 
                                  icon={MessageSquare} 
                                  label="Reviews" 
                                  value={collection._count?.review || 0} 
                                  color="text-green-400"
                                />
                                <StatCard 
                                  icon={Library} 
                                  label="Library" 
                                  value={collection._count?.library || 0} 
                                  color="text-purple-400"
                                />
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => navigate(`/dashboard/collections/collection/${collection.id}`)}
                                  className="flex-1 btn text-xs sm:text-sm py-2 flex items-center justify-center gap-1.5 sm:gap-2"
                                  aria-label={`View media for ${collection.name}`}
                                >
                                  <Image className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  <span className="hidden xs:inline">View Media</span>
                                  <span className="xs:hidden">Media</span>
                                </button>
                                <button
                                  onClick={() => navigate(`/dashboard/update collection/${collection.id}`)}
                                  className="px-3 sm:px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-all duration-300"
                                  aria-label={`Edit ${collection.name}`}
                                >
                                  <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-theme" />
                                </button>
                                {/* ✅ NEW: Publish/Unpublish Button */}
                                <button
                                  disabled={publishingId === collection.id}
                                  onClick={() => togglePublish(collection.id, collection.isPublished)}
                                  className="px-3 sm:px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-all duration-300 disabled:opacity-50"
                                  aria-label={collection.isPublished ? 'Unpublish collection' : 'Publish collection'}
                                  title={collection.isPublished ? 'Unpublish' : 'Publish'}
                                >
                                  {publishingId === collection.id ? (
                                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-theme border-t-transparent rounded-full animate-spin"></div>
                                  ) : collection.isPublished ? (
                                    <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-theme" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-theme" />
                                  )}
                                </button>
                                <button
                                  disabled={deletingId === collection.id}
                                  onClick={() => {
                                    showConfirm(
                                      'Delete Collection',
                                      `Are you sure you want to delete "${collection.name}"? This action cannot be undone.`,
                                      () => handleDelete(collection.id)
                                    );
                                  }}
                                  className="px-3 sm:px-4 py-2 bg-destructive/20 hover:bg-destructive/30 rounded-lg transition-all duration-300 disabled:opacity-50"
                                  aria-label={`Delete ${collection.name}`}
                                >
                                  {deletingId === collection.id ? (
                                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card text-center py-12 sm:py-20">
                      <Image className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-secondary opacity-50" />
                      <p className="text-base sm:text-lg text-secondary mb-2">No collections found</p>
                      <p className="text-xs sm:text-sm text-secondary mb-6">Create your first collection to get started</p>
                      <Button 
                        onClick={() => navigate('/dashboard/create collection')}
                        className="btn"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Collection
                      </Button>
                    </div>
                  )}
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
    </>
  );
}

export default Collections;
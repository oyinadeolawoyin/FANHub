import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/authContext';
import { Plus, ListChecks, BookOpen, Eye, EyeOff, Trash2, Loader2, Edit2, Heart, Star, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Toast, useToast, ConfirmDialog, useConfirm, WarningDialog, useWarning } from "../utils/toast-modal";

const API_URL = 'https://fanhub-server.onrender.com';

export default function RecommendationListPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecommendation, setEditingRecommendation] = useState(null);
  const [publishingId, setPublishingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { toast, showToast, closeToast } = useToast();
  const { confirm, showConfirm, closeConfirm } = useConfirm();
  const { warning, showWarning, closeWarning } = useWarning();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/recommendations/${user.id}/my-lists`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, coverImage: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    if (formData.coverImage) {
      data.append('file', formData.coverImage);
    }

    try {
      const response = await fetch(`${API_URL}/api/recommendations/create`, {
        method: 'POST',
        body: data,
        credentials: 'include',
      });

      if (response.ok) {
        showToast('Recommendation list created successfully!', 'success');
        setIsCreateModalOpen(false);
        setFormData({ title: '', description: '', coverImage: null });
        setImagePreview(null);
        fetchRecommendations();
      } else {
        showToast('Failed to create recommendation list', 'error');
      }
    } catch (error) {
      console.error('Error creating recommendation:', error);
      showToast('An error occurred while creating the list', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    if (formData.coverImage) {
      data.append('file', formData.coverImage);
    }

    try {
      const response = await fetch(`${API_URL}/api/recommendations/${editingRecommendation.id}`, {
        method: 'PUT',
        body: data,
        credentials: 'include',
      });

      if (response.ok) {
        showToast('Recommendation list updated successfully!', 'success');
        setIsEditModalOpen(false);
        setEditingRecommendation(null);
        setFormData({ title: '', description: '', coverImage: null });
        setImagePreview(null);
        fetchRecommendations();
      } else {
        showToast('Failed to update recommendation list', 'error');
      }
    } catch (error) {
      console.error('Error updating recommendation:', error);
      showToast('An error occurred while updating the list', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (rec) => {
    setEditingRecommendation(rec);
    setFormData({
      title: rec.title,
      description: rec.description || '',
      coverImage: null,
    });
    setImagePreview(rec.coverImage || null);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/recommendations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        showToast('Recommendation list deleted successfully', 'success');
        fetchRecommendations();
      } else {
        showToast('Failed to delete recommendation list', 'error');
      }
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      showToast('An error occurred while deleting the list', 'error');
    }
  };

  // ✅ UPDATED: Toggle publish with validation
  const togglePublish = async (id, currentStatus) => {
    const rec = recommendations.find(r => r.id === id);
    
    // Validate: Check if list has at least one story before publishing
    if (!currentStatus && (!rec._count?.stories || rec._count.stories === 0)) {
      showWarning(
        'Cannot Publish List',
        'Please add at least one story to your recommendation list before publishing it. Your followers are waiting to discover great reads!'
      );
      return;
    }

    setPublishingId(id);
    try {
      const response = await fetch(`${API_URL}/api/recommendations/${id}/publish`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (response.ok) {
        showToast(
          currentStatus ? 'List unpublished successfully' : 'List published successfully',
          'success'
        );
        // Update local state
        setRecommendations(prev => prev.map(r => 
          r.id === id ? { ...r, isPublished: !currentStatus } : r
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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

      {/* ✅ NEW: Warning Dialog */}
      <WarningDialog
        isOpen={warning.isOpen}
        onClose={closeWarning}
        title={warning.title}
        description={warning.description}
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex-shrink-0">
            <ListChecks className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-theme">
              My Recommendation Lists
            </h1>
            <p className="text-sm sm:text-base text-secondary mt-0.5 sm:mt-1">
              Curate and share your favorite stories
            </p>
          </div>
        </div>

        {/* Create Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto btn whitespace-nowrap">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">Create New List</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card-theme border-theme max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-theme text-lg sm:text-xl">Create Recommendation List</DialogTitle>
              <DialogDescription className="text-secondary text-sm">
                Start curating your favorite stories into a collection
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title" className="text-theme text-sm font-medium">
                  Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Best Fantasy Romance"
                  maxLength={100}
                  required
                  className="mt-1.5 text-sm sm:text-base"
                />
                <p className="text-xs text-secondary mt-1.5">{formData.title.length}/100</p>
              </div>

              <div>
                <Label htmlFor="description" className="text-theme text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what makes this list special..."
                  rows={4}
                  className="mt-1.5 text-sm sm:text-base resize-none"
                />
              </div>

              <div>
                <Label htmlFor="coverImage" className="text-theme text-sm font-medium">
                  Cover Image
                </Label>
                <Input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1.5 text-sm"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-3 w-full h-32 sm:h-40 object-cover rounded-lg border border-theme"
                  />
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 text-sm sm:text-base"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !formData.title.trim()}
                  className="flex-1 btn text-sm sm:text-base"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create List'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="bg-card-theme border-theme max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-theme text-lg sm:text-xl">Edit Recommendation List</DialogTitle>
              <DialogDescription className="text-secondary text-sm">
                Update your recommendation list details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div>
                <Label htmlFor="edit-title" className="text-theme text-sm font-medium">
                  Title *
                </Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Best Fantasy Romance"
                  maxLength={100}
                  required
                  className="mt-1.5 text-sm sm:text-base"
                />
                <p className="text-xs text-secondary mt-1.5">{formData.title.length}/100</p>
              </div>

              <div>
                <Label htmlFor="edit-description" className="text-theme text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what makes this list special..."
                  rows={4}
                  className="mt-1.5 text-sm sm:text-base resize-none"
                />
              </div>

              <div>
                <Label htmlFor="edit-coverImage" className="text-theme text-sm font-medium">
                  Cover Image {imagePreview && '(Change)'}
                </Label>
                <Input
                  id="edit-coverImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1.5 text-sm"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-3 w-full h-32 sm:h-40 object-cover rounded-lg border border-theme"
                  />
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingRecommendation(null);
                    setFormData({ title: '', description: '', coverImage: null });
                    setImagePreview(null);
                  }}
                  className="flex-1 text-sm sm:text-base"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !formData.title.trim()}
                  className="flex-1 btn text-sm sm:text-base"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update List'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty State */}
      {recommendations.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center border-2 border-dashed">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <ListChecks className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500" />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg sm:text-xl font-semibold text-theme mb-2">
                No recommendation lists yet
              </h3>
              <p className="text-sm sm:text-base text-secondary mb-6">
                Start curating your favorite stories and share them with others
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)} className="btn">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Create Your First List
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        /* Recommendation Lists Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {recommendations.map((rec) => (
            <Card
              key={rec.id}
              className="group overflow-hidden cursor-pointer p-0"
              onClick={() => navigate(`/dashboard/recommendation/${rec.id}`)}
            >
              {/* Cover Image */}
              <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600">
                {rec.coverImage ? (
                  <img
                    src={rec.coverImage}
                    alt={rec.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ListChecks className="w-12 h-12 sm:w-16 sm:h-16 text-white/80" />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                      rec.isPublished
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {rec.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>

                {/* Story Count Badge */}
                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                  <div className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm">
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{rec._count?.stories || 0} stories</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-bold text-theme mb-2 line-clamp-2 group-hover:text-blue-500 transition-colors">
                  {rec.title}
                </h3>
                {rec.description && (
                  <p className="text-xs sm:text-sm text-secondary line-clamp-2 mb-3 sm:mb-4">
                    {rec.description}
                  </p>
                )}

                {/* Story Previews */}
                {rec.stories && rec.stories.length > 0 && (
                  <div className="flex -space-x-2 mb-3 sm:mb-4">
                    {rec.stories.slice(0, 4).map((story, idx) => (
                      <img
                        key={idx}
                        src={story.story?.imgUrl}
                        alt={story.story?.title}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                      />
                    ))}
                    {rec._count?.stories > 4 && (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300">
                        +{rec._count.stories - 4}
                      </div>
                    )}
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1 text-red-500">
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                    <span className="font-medium">{rec._count?.likes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-500">
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="font-medium">{rec._count?.comments || 0}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 sm:pt-4 border-t border-theme">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(rec);
                    }}
                    className="flex-1 text-xs sm:text-sm"
                    aria-label="Edit list"
                  >
                    <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={publishingId === rec.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePublish(rec.id, rec.isPublished);
                    }}
                    className="flex-1 text-xs sm:text-sm disabled:opacity-50"
                    aria-label={rec.isPublished ? 'Unpublish list' : 'Publish list'}
                  >
                    {publishingId === rec.id ? (
                      <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 animate-spin" />
                    ) : rec.isPublished ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Unpublish</span>
                        <span className="sm:hidden">Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                        <span>Publish</span>
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      showConfirm(
                        'Delete Recommendation List',
                        `Are you sure you want to delete "${rec.title}"? This action cannot be undone.`,
                        () => handleDelete(rec.id)
                      );
                    }}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs sm:text-sm px-3"
                    aria-label="Delete list"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
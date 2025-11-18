import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCollections } from "./collectionContext";
import { ImagePlus, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toast, useToast } from "../utils/toast-modal";
import { 
  FormCard, 
  ImageUploadWithCrop, 
  VideoUploadWithPreview, 
  StyledInput,
  StyledShadcnSelect 
} from "../css/formStyling";

function UploadMedia({ mediaType, onSuccess, isModal = false }) {
  const [form, setForm] = useState({
    caption: "",
    file: null,
    collectionId: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { collections } = useCollections();
  const { toast, showToast, closeToast } = useToast();

  const mediaTypeName = mediaType.charAt(0).toUpperCase() + mediaType.slice(1);
  const apiEndpoint = `https://fanhub-server.onrender.com/api/gallery/upload${mediaTypeName}`;
  const navPath = `/dashboard/${mediaType}s`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileSelected = (file) => {
    setForm((prev) => ({ ...prev, file }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("caption", form.caption);
    formData.append("file", form.file);
    formData.append("collectionId", form.collectionId);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 500) {
        navigate("/error", {
          state: { message: data.message || "Process failed" }
        });
        return;
      } else {
        if (!response.ok && response.status !== 500) {
          setError(data.message);
          return;
        }
      }

      // Success!
      if (isModal && onSuccess) {
        // If it's a modal, call onSuccess callback
        onSuccess();
      } else {
        // If it's a page, show toast and navigate
        showToast(`${mediaTypeName} uploaded successfully!`, 'success');
        setTimeout(() => navigate(navPath), 1000);
      }
      
      // Reset form
      setForm({ caption: "", file: null, collectionId: "" });
    } catch (err) {
      navigate("/error", {
        state: { message: "Network error: Please check your internet connection." }
      });
    } finally {
      setLoading(false);
    }
  }

  // Convert collections to options format for shadcn select
  const collectionOptions = collections.map((collection) => ({
    value: String(collection.id),
    label: collection.name,
    icon: "📚"
  }));

  const FormContent = (
    <>
      {!isModal && <Toast {...toast} onClose={closeToast} />}
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <StyledInput
          label="Caption"
          name="caption"
          value={form.caption}
          onChange={handleChange}
          placeholder={`Add a caption for your ${mediaType}...`}
          required
        />

        {mediaType === "image" ? (
          <ImageUploadWithCrop
            label={`Upload ${mediaTypeName}`}
            onImageCropped={handleFileSelected}
            required
          />
        ) : (
          <VideoUploadWithPreview
            label={`Upload ${mediaTypeName}`}
            onVideoSelected={handleFileSelected}
            required
          />
        )}

        <StyledShadcnSelect
          label="Collection (Optional)"
          name="collectionId"
          value={form.collectionId}
          onChange={handleChange}
          options={collectionOptions}
          placeholder="Select a collection"
        />

        {error && (
          <div 
            className="p-3 sm:p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-fadeIn"
            role="alert"
          >
            <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full btn text-sm sm:text-base py-4 sm:py-5 sm:py-6 font-semibold"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" 
                aria-hidden="true"
              />
              <span>Uploading...</span>
            </div>
          ) : (
            `Upload ${mediaTypeName}`
          )}
        </Button>
      </form>
    </>
  );

  // If it's a modal, return just the form content
  if (isModal) {
    return FormContent;
  }

  // If it's a page, wrap in FormCard
  return (
    <FormCard
      title={`Upload ${mediaTypeName}`}
      description={`Share your ${mediaType} with the world`}
      icon={mediaType === "image" ? ImagePlus : Video}
    >
      {FormContent}
    </FormCard>
  );
}

export default UploadMedia;
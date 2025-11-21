import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ImagePlus } from "lucide-react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";

function CreatePost({ onPostCreated, writerId, username }) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    file: null,
    mediaType: "",
    writerId,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleChange = (e) => {
    if (!e?.target) return;
    const { name, value, type, files } = e.target;

    if (type === "file" && files[0]) {
      const file = files[0];
      const mediaType = file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("image/")
        ? "image"
        : "unknown";
      setForm((prev) => ({ ...prev, file, mediaType }));

      // Create preview URL
      setPreview(URL.createObjectURL(file));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("writerId", form.writerId);

    try {
      if (form.file && form.mediaType === "image" && croppedAreaPixels) {
        // Convert cropped area to blob
        const croppedBlob = await getCroppedImg(preview, croppedAreaPixels);
        formData.append("file", croppedBlob, form.file.name);
        formData.append("type", "image");
      } else if (form.file) {
        formData.append("file", form.file);
        formData.append("type", form.mediaType);
      }

      const response = await fetch(
        "https://fanhub-server.onrender.com/api/posts/create-post",
        { method: "POST", body: formData, credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      if (onPostCreated) onPostCreated(data.post);
      setForm({ title: "", content: "", file: null, mediaType: "", writerId });
      setPreview(null);
    } catch (err) {
      navigate("/error", { state: { message: "Network error" } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative bg-card-theme p-4 rounded-2xl shadow space-y-3"
    >
      <input
        type="text"
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Add a title..."
        required
        className="w-full p-3 rounded-lg border border-gray-300 focus:ring focus:ring-blue-400 focus:outline-none"
        aria-label="Post title"
      />

      <div className="relative">
        <Textarea
          name="content"
          placeholder={`Write to ${username}...`}
          value={form.content}
          onChange={handleChange}
          required
          aria-label="Post content"
          rows={4}
        />
        <label htmlFor="file">
          <ImagePlus
            className="absolute right-3 bottom-3 w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-600"
            title="Upload media"
          />
        </label>
        <input
          id="file"
          type="file"
          name="file"
          accept="image/*,video/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {/* Image Crop Preview */}
      {preview && form.mediaType === "image" && (
        <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
          <Cropper
            image={preview}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full"
      >
        {loading && <Loader2 className="animate-spin w-4 h-4" />}
        {loading ? "Posting..." : "Post"}
      </Button>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}

export default CreatePost;
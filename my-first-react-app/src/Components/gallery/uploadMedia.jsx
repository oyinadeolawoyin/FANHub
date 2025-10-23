import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCollections } from "./collectionContext";

function UploadMedia({ mediaType }) {
  const [form, setForm] = useState({
    caption: "",
    file: null,
    collectionId: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { collections } = useCollections();

  // Capitalize first letter for display
  const mediaTypeName = mediaType.charAt(0).toUpperCase() + mediaType.slice(1);
  
  // API endpoint based on media type
  const apiEndpoint = `https://fanhub-server.onrender.com/api/gallery/upload${mediaTypeName}`;
  
  // Navigation path after upload
  const navPath = `/dashboard/${mediaType}s`;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
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

      alert("Uploaded!");
      navigate(navPath);
    } catch (err) {
      navigate("/error", { 
        state: { message: "Network error: Please check your internet connection." } 
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Upload {mediaTypeName}</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Caption:{" "}
          <input
            type="text"
            name="caption"
            value={form.caption}
            onChange={handleChange}
            required
          />
        </label>
        
        <label>
          Upload {mediaTypeName}:{" "}
          <input
            type="file"
            name="file"
            accept={mediaType === "image" ? "image/*" : "video/*"}
            onChange={handleChange}
            required
          />
        </label>
        
        <label htmlFor="collection">Choose Collection:</label>
        <select
          id="collection"
          name="collectionId"
          value={form.collectionId}
          onChange={handleChange}
        >
          <option value="">-- Select a collection --</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
        
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Upload"}
        </button>
      </form>
      
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default UploadMedia;
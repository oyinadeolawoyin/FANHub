import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { tags } from "../genre/tags";

function CreateTweet() {
  const [form, setForm] = useState({
    title: "",
    content: "",
    file: null,
    type: "",
    tags: ["All"],
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (!e || !e.target) return;
    const { name, value, type, files } = e.target;
  
    setForm((prev) => {
      if (type === "file" && files[0]) {
        const file = files[0];
        const mediaType = file.type.startsWith("video/")
          ? "video"
          : file.type.startsWith("image/")
          ? "image"
          : "unknown";
  
        return { ...prev, file, mediaType };
      }
      return { ...prev, [name]: value };
    });
  };
  
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("content", form.content);
    formData.append("tags", JSON.stringify(form.tags));
  
    if (form.file) {
      formData.append("file", form.file);
      formData.append("type", form.mediaType || "unknown");
    }
  
    try {
      const response = await fetch(
        "https://fanhub-server.onrender.com/api/tweets/create",
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );
  
      const data = await response.json();
  
      if (response.status === 500) {
        navigate("/error", {
          state: { message: data.message || "Process failed" },
        });
        return;
      }
  
      if (!response.ok && response.status !== 500) {
        setError(data.message);
        return;
      }
  
      alert("Tweet created!");
      navigate(`/tweets`);
    } catch (err) {
      navigate("/error", {
        state: {
          message: "Network error: Please check your internet connection.",
        },
      });
    } finally {
      setLoading(false);
    }
  }
  

  return (
    <div>
      <h2>Create Tweet</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Title:{" "}
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter your tweet title"
          />
        </label>

        <label>
          Content:{" "}
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Write your thoughts here..."
          />
        </label>

        <label>
          Upload Media (optional):{" "}
          <input
            type="file"
            name="media"
            accept="image/*,video/*"
            onChange={handleChange}
          />
        </label>

        <label>
          Tags:
          <Select
            isMulti
            name="tags"
            options={tags.map((tag) => ({ value: tag, label: tag }))}
            value={form.tags.map((t) => ({ value: t, label: t }))}
            onChange={(selected) => {
            // Ensure selected is always an array
            const selectedValues = selected ? selected.map((s) => s.value) : [];

            // Always include "All" and prevent duplicates
            const finalTags = Array.from(new Set(["All", ...selectedValues]));

            // Limit to 5 tags maximum (including "All")
            if (finalTags.length > 5) return;

            setForm((prev) => ({
              ...prev,
              tags: finalTags,
            }));
            }}
            placeholder="Select up to 5 tags"
            classNamePrefix="select"
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Create"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default CreateTweet;
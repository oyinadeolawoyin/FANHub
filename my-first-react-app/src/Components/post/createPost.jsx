import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreatePost({ onPostCreated }) {
  const [form, setForm] = useState({
      title: "",
      content: "",
      file: "",
      type: ""
  });
  
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  
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
  
  async function handleSubmit (e) {
      e.preventDefault();
      setError("");
      setLoading(true);

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", form.content); 
      formData.append("file", form.file);
      
      if (form.file) {
        formData.append("file", form.file);
        formData.append("type", form.mediaType || "unknown");
      }
  
      try {
        const response = await fetch(`https://fanhub-server.onrender.com/api/posts/create-post`, {
          method: "POST",
          body: formData,
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
        
        
        alert("created!")
        
        //Call back up to ProfilePosts to update UI immediately
        if (onPostCreated) {
          onPostCreated(data.posts);
        }
          
      }  catch(err) {
        navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
      } finally {
        setLoading(false);
      }
  };
  
  
  return (
    <div>
      <h2>Create Post</h2>
    
      <form onSubmit={handleSubmit}>
        <label>
          Title:{" "}
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Content:{" "}
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            placeholder="Write here..."
          />
        </label>

        <label>
          Upload image:{" "}
          <input
            type="file"
            name="file"
            accept="image/*"
            onChange={handleChange}
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

export default CreatePost;
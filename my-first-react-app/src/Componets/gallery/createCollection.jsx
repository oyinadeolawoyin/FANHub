import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCollections } from "./collectionContext";
import { useAuth } from "../auth/authContext";

function CreateCollection() {
    const [form, setForm] = useState({
        name: "",
        file: null,
        description: "",
        tags: "",
        status: "ongoing",
    });

    const { user } = useAuth();
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { setCollections } = useCollections();

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
        formData.append("name", form.name);
        formData.append("description", form.description);
        formData.append("tags", form.tags);
        formData.append("status", form.status);
        formData.append("file", form.file);  
    
        try {
            const response = await fetch("https://fanhub-server.onrender.com/api/gallery/createCollection", {
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
    
            alert("Created!");  
            setCollections(prev => [...prev, data.collection])
    
            navigate(`/dashboard/collections/${user.id}`); 
        } catch(err) {
          navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
          setLoading(false);
        }
    };
    
    
    return (
        <div>
          <h2>Add new collection</h2>
     
          <form onSubmit={handleSubmit}>
            <label>
              Name:{" "}
              <input
                type="text"
                name="name"
                value={form.title}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Upload image:{" "}
              <input
                type="file"
                name="file"
                onChange={handleChange}
                required
              />
            </label>
            <label>
              description:{" "}
              <textarea
                name="description"
                value={form.summary}
                onChange={handleChange}
                required
                placeholder="Write here..."
              />
            </label>
            <label>
              Tags:{" "}
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Status:{" "}
              <input
                type="text"
                name="status"
                placeholder="ongoing/completed"
                value={form.status}
                onChange={handleChange}
                required
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Upload"}
            </button>
          </form>
     
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}      

export default CreateCollection;
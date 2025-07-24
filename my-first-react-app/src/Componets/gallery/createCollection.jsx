import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCollections } from "./collectionContext";

function CreateCollection() {
    console.log("here...")
    const [form, setForm] = useState({
        name: "",
        file: null,
        description: "",
        tags: "",
        status: "ongoing",
    });
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

    const handleSubmit = async (e) => {
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
            console.log("data", data);
            if (!response.ok) {
                setError(data.message || "Something is wrong. Try again!");
                setLoading(false);
                return;
            }
    
            alert("Created!");  
            setCollections(prev => [...prev, data.collection])
    
            navigate("/dashboard"); 
        } catch(err) {
            alert("Something went wrong. Please try again.");
            setLoading(false);
        }
    };
    
    
    return (
        <div>
          <h2>Add new collection</h2>
      
          {loading && <div>Loading, please wait...</div>}
          {error && <p style={{ color: "red" }}>{error}</p>}
      
          {!loading && (
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
              <button type="submit">Create</button>
            </form>
          )}
        </div>
    );
}      

export default CreateCollection;
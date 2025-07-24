import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useCollections } from "./collectionContext";

function UpdateCollections() {
    const { id } = useParams();
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { collections, setCollections } = useCollections();

    const collection = collections.find(collectionElement => collectionElement.id == id);

    const [form, setForm] = useState({
        name: collection?.name,
        file: collection?.img,
        description: collection?.description,
        tags: collection?.tags,
        status: collection?.status
    });
    

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
            const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/collections/${id}/update`, {
                method: "POST",
                body: formData,
                credentials: "include",
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                setError(data.message || "Something is wrong. Try again!");
                setLoading(false);
                return;
            }
    
            alert("Updated!");  
            console.log("updat", data);
            setCollections(prev =>
                [...prev.filter(s => s.id !== collection.id), data.collection]
            );              
            console.log("s:",collections)
    
            navigate("/dashboard"); 
        } catch(err) {
            alert("Something went wrong. Please try again.");
            setLoading(false);
        }
    };
    
    
    return (
        <div>
          <h2>Update Your Collection</h2>
      
          {loading && <div>Loading, please wait...</div>}
          {error && <p style={{ color: "red" }}>{error}</p>}
      
          {!loading && (
            <form onSubmit={handleSubmit}>
              <label>
                Name:{" "}
                <input
                  type="text"
                  name="name"
                  value={form.name}
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
                Description:{" "}
                <textarea
                  name="description"
                  value={form.description}
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
              <button type="submit">Update</button>
            </form>
          )}
        </div>
    );
}      

export default UpdateCollections;
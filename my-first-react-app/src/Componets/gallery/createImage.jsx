import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useImages } from "./imagesContext";
import { useCollections } from "./collectionContext";

function UploadImage() {
    const [form, setForm] = useState({
        caption: "",
        file: null,
        collectionId: "",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const {setImages} = useImages();
    const { collections } = useCollections();

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
        formData.append("caption", form.caption);
        formData.append("file", form.file); 
        formData.append("collectionId", form.collectionId);
    
        try {
            const response = await fetch("https://fanhub-server.onrender.com/api/gallery/uploadImage", {
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
    
            alert("Uploaded!"); 
            setImages(prev => [...prev, data.image]);
    
            navigate("/dashboard/images"); 
        } catch(err) {
            alert("Something went wrong. Please try again.");
            setLoading(false);
        }
    };
    
    
    return (
        <div>
          <h2>Upload Image</h2>
      
          {loading && <div>Loading, please wait...</div>}
          {error && <p style={{ color: "red" }}>{error}</p>}
      
          {!loading && (
            <form onSubmit={handleSubmit}>
              <label>
                Caption:{" "}
                <input
                  type="text"
                  name="caption"
                  value= {form.caption}
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
              <label htmlFor="collection">Choose Collection:</label>
              <select 
                  id="collection"
                  name="collectionId"
                  value={form.collectionId} 
                  onChange={handleChange}
              >
                  <option value="">-- Select a collection --</option>
                  {collections.map(collection => (
                      <option key={collection.id} value={collection.id}>
                          {collection.name}
                      </option>
                  ))}
              </select>
              <button type="submit">Upload</button>
            </form>
          )}
        </div>
    );
}      

export default UploadImage;
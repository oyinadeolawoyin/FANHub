import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useStories } from "./storiesContext";

function Updatestory() {
    const { id } = useParams();
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { stories, setStories } = useStories();

    const story = stories.find(storyElement => storyElement.id == id);

    const [form, setForm] = useState({
        title: story.title,
        file: story.imgUrl,
        summary: story.summary,
        tags: story.tags,
        status: story.status,
        type: story.type
    });
    

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
        formData.append("title", form.title);
        formData.append("summary", form.summary);
        formData.append("tags", form.tags);
        formData.append("status", form.status);
        formData.append("file", form.file); 
    
        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}`, {
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
            setStories(prev =>
                [...prev.filter(s => s.id !== story.id), data.story]
            );              
            console.log("s:",stories)
    
            navigate("/dashboard"); 
        } catch(err) {
            alert("Something went wrong. Please try again.");
            setLoading(false);
        }
    };
    
    
    return (
        <div>
          <h2>Update Your Story</h2>
      
          {loading && <div>Loading, please wait...</div>}
          {error && <p style={{ color: "red" }}>{error}</p>}
      
          {!loading && (
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
                Upload image:{" "}
                <input
                  type="file"
                  name="file"
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Summary:{" "}
                <textarea
                  name="summary"
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
                Story status:{" "}
                <input
                  type="text"
                  name="status"
                  placeholder="ongoing/completed"
                  value={form.status}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Type:{" "}
                <input
                  type="text"
                  name="type"
                  placeholder="novel/short story"
                  value={form.type}
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

export default Updatestory;
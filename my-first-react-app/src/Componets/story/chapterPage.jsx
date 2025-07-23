import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useStories } from "./storiesContext";

function UpdateChapter() {
    const { id, chapterId } = useParams();
    console.log("id", id, "chpterId", chapterId);
    const { stories } = useStories();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    console.log("chatId", chapterId);
    const story = stories.find(storyElement => storyElement.id == id);
    console.log("chapStor", story, "storyChapters", story.chapters);
    const chapter = story?.chapters.find(ch => ch.id == chapterId);
    console.log("updateChap", chapter);

    const [form, setForm] = useState({
        title: chapter.title || "",
        content: chapter.content || "",
    });
    

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prevForm => ({
          ...prevForm,
          [name]: value
        }));
    }    

    async function handleSubmit (e, status) {
        e.preventDefault();
        setError("");
        setLoading(true);
    
        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/chapters/${chapterId}/${status}/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
                credentials: "include",
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                setError(data.message || "Something is wrong. Try again!");
                setLoading(false);
                return;
            }
    
            alert("Updated!");  
    
            navigate(`/story/${id}`); 
        } catch(err) {
            alert("Something went wrong. Please try again.");
            setLoading(false);
        }
    };
    
    
    return (
        <div>
          <h2>Create chapter</h2>
      
          {loading && <div>Loading, please wait...</div>}
          {error && <p style={{ color: "red" }}>{error}</p>}
      
          {!loading && (
            <form>
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
                <button onClick={(e) => handleSubmit(e, "publish")}>Update</button>
                <button onClick={(e) => handleSubmit(e, "unpublish")}>save As Draft</button>
            </form>
          )}
        </div>
    );
}      

export default UpdateChapter;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";

function CreateChapter() {
    const [form, setForm] = useState({
        title: "",
        content: "",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { id } = useParams();

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prevForm => ({
          ...prevForm,
          [name]: value
        }));
    }    

    async function handleSubmit(e, status) {
      e.preventDefault();
      setError("");
      setLoading(true);
    
      try {
        const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/createChapter/${status}`, {
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
    
        const streakRes = await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/writingStreak`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
    
        if (!streakRes.ok) {
          const errData = await streakRes.json();
          console.warn("Streak update failed:", errData.message || "Unknown error");
        }
    
        alert(data.message || "Chapter created!");
        navigate(`/dashboard/story/${id}`);
      } catch (err) {
        console.error(err);
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }    
    
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
                <button onClick={(e) => handleSubmit(e, "publish")}>Create</button>
                <button onClick={(e) => handleSubmit(e, "unpublish")}>save As Draft</button>
            </form>
          )}
        </div>
    );
}      

export default CreateChapter;
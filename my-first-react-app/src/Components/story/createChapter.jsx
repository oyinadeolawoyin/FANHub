import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";

function CreateChapter() {
    const [form, setForm] = useState({
        title: "",
        content: "",
    });

    const { user } = useAuth();
    const { id } = useParams();
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [loadingStates, setLoadingStates] = useState({
      publish: false,
      draft: false,
    });
    

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
      setLoadingStates(prev => ({ ...prev, [status]: true }));
    
      try {
        const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/createChapter/${status}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
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
    
        // const streakRes = 
        await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/writingStreak`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        // const streakData = await streakRes.json();
    
        // if (streakRes.status === 500) {
        //   navigate("/error", { state: { message: streakData.message || "Process failed" } });
        //   return;
        // } else {
        //     if (!streakRes.ok && streakRes.status !== 500) {
        //         setError(streakData.message); 
        //         return;
        //     }
        // } 
        
        // const socialResponse = 
        await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/social/writingpoint`, {
          method: "POST",
          credentials: "include",
        });

        // const socialData = await socialResponse.json();
        // if (socialResponse.status === 500) {
        //   navigate("/error", { state: { message: socialData.message || "Process failed" } });
        //   return;
        // } else {
        //     if (!socialResponse.ok && socialResponse.status !== 500) {
        //         setError(socialData.message); 
        //         return;
        //     }
        // }  
        alert("Chapter created!");
        navigate(`/dashboard/story/${id}`);
      } catch (err) {
        navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
      } finally {
        setLoadingStates(prev => ({ ...prev, [status]: false }));
      }
    }    
    
    return (
        <div>
          <h2>Create chapter</h2>
          
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

            <button type="submit" disabled={loadingStates.publish}
              onClick={(e) => handleSubmit(e, "publish")}>
                {loadingStates.publish  ? "Loading..." : "Publish"}
            </button>
            
            <button type="submit" disabled={loadingStates.draft}
              onClick={(e) => handleSubmit(e, "unpublish")}>
                {loadingStates.draft  ? "Loading..." : "Save As Draft"}
            </button>
          </form>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}      

export default CreateChapter;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

function UpdateChapter() {
    const { id, chapterId } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loadingStates, setLoadingStates] = useState({
        publish: false,
        draft: false,
    });
    const [loading, setLoading] = useState(false);
    const [chapter, setChapter] = useState(null);
    const [form, setForm] = useState({
      title: "",
      content: "",
    });
    
    useEffect(() => {
      if (chapter) {
        setForm({
          title: chapter.title || "",
          content: chapter.content || "",
        });
      }
    }, [chapter]); //re-runs when chapter changes
    
    

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prevForm => ({
          ...prevForm,
          [name]: value
        }));
    }   
    
    useEffect(() => {
      async function fetchChapter() {
        setLoading(true);
        setError("");
        try {
          const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/chapters/${chapterId}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
    
          const data = await response.json();
    
          if (response.status === 500) {
            navigate("/error", { state: { message: data.message || "Process failed" } });
            return;
          }
    
          if (!response.ok && response.status !== 500) {
            setError(data.message || "Failed to load chapter");
            return;
          }
    
          setChapter(data.chapter);
        } catch (err) {
          navigate("/error", {
            state: { message: "Network error: Please check your internet connection." },
          });
        } finally {
          setLoading(false);
        }
      }
    
      fetchChapter();
    }, [id, chapterId]);
  

    async function handleSubmit (e, status) {
        e.preventDefault();
        setError("");
        setLoadingStates(prev => ({ ...prev, [status]: true }));
    
        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/chapters/${chapterId}/${status}/update`, {
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
    
            alert("Updated!");  
    
            navigate(`/dashboard/story/${id}`); 
        } catch(err) {
          navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
          setLoadingStates(prev => ({ ...prev, [status]: false }));
        }
    };
    
    
  return (
      <div>
        <h2>Update chapter</h2>
        {loading && <p>Loading chapter...</p>}
        {chapter && (
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
        )}
       
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
  );
}      

export default UpdateChapter;
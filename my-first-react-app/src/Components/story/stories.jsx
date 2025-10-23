import Delete from "../delete/delete";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function Stories() {
  const { id } = useParams();
  const [stories, setStories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletmessage, setDeletemessage] = useState("");
  const navigate = useNavigate();
    
  useEffect(() => {
    async function fetchStories() {
        setError("");
        setLoading(true);

        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}`, {
                method: "GET",
                credentials: "include",
            });
    
            const data = await response.json();
            console.log("stor", data);
            if (response.status === 500) {
                navigate("/error", { state: { message: data.message || "Process failed" } });
                return;
            } else {
                if (!response.ok && response.status !== 500) {
                    setError(data.message); 
                    return;
                }
            } 

            setStories(data.stories);
            
        } catch(err) {
            navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
            setLoading(false);
        }
      };

      fetchStories();
  }, [id]);

  async function handleDelete(id) {
    setDeletingId(id);
    try{
        const message = await Delete(`https://fanhub-server.onrender.com/api/stories/${id}`);
        setDeletemessage(message);
        setStories(prev => prev.filter(s => Number(s.id) !== Number(id)));
    } catch(err) {
        navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
    } finally {
        setDeletingId(null);
    }
  }

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? (<p>loading...</p>) : (
        <div>
            {stories && stories.length > 0 ? (
                <ul>
                    {stories.map((story) => (
                        <div key={story.id}>
                            <li>
                                <img 
                                    style={ {width: "200px" } } 
                                    src={story.imgUrl}
                                />
                            </li>
                            <li>{story.title}</li>
                            <li>{story.summary}</li>
                            <li>{story.primarygenre} / {story.secondarygenre}</li>
                            <li>{story.status}</li>
                            <li>{story.type}</li>
                            <button type="submit"  disabled={deletingId === story.id}
                                onClick={() => {
                                    const confirmed = window.confirm("Are you sure you want to delete this story?");
                                    if (confirmed) {
                                    handleDelete(story.id);
                                    }
                                }}
                            >
                                {deletingId === story.id ? "Loading..." : "Delete" || deletmessage !== "" && {deletmessage} }
                            </button>
                            <button onClick={() => navigate(`/dashboard/update-story/${story.id}`)}>
                                Edit
                            </button>

                            <button onClick={() => navigate(`/dashboard/story/${story.id}`)}>
                                View
                            </button>
                        </div>
                    ))}
                </ul>
            ) : (
                <p>No Story found.</p>
            )}
        </div>
      )}
    </div>
  );
}

export default Stories;
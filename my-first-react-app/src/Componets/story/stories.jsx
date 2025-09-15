import Delete from "../delete/delete";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function Stories() {
  const { id } = useParams();
  const [stories, setStories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  console.log("idd", id);

    
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
            console.log("data", data);
            
            if (!response.ok) {
                setError(data.message);
                return;
            } 
            setStories(data.stories);
            console.log("stories", stories);
            
        } catch(err) {
            console.log("error", err);
            alert("Something went wrong. Please try again.");
        } finally{
            setLoading(false);
        }
      };

      fetchStories();
  }, []);

  async function handleDelete(id) {
    try{
        const message = await Delete(`https://fanhub-server.onrender.com/api/stories/${id}`);
        alert(message);
        setStories(prev => prev.filter(s => s.id !== id));
    } catch(err) {
        console.log("Failed to delete:", err.message);
    } 
  }

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>loading...</p>}
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
                    <li>{story.tags}</li>
                    <li>{story.status}</li>
                    <li>{story.type}</li>
                    <button
                        onClick={() => {
                            const confirmed = window.confirm("Are you sure you want to delete this story?");
                            if (confirmed) {
                            handleDelete(story.id);
                            }
                        }}
                    >
                        Delete
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
  );
}

export default Stories;
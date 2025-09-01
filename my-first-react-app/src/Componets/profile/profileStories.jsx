// import { useStories } from "../story/storiesContext";
import { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";

function ProfileStories() {
  // const { stories, loading, error } = useStories();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
      async function fetchStories() {
          setError("");
          setLoading(true);
          try {
              const response = await fetch(`https://fanhub-server.onrender.com/api/stories`, {
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
    }, 
  []);
  if (loading) {
    return <div>Loading, please wait...</div>;
  }

  async function addToLibrary(id) {
    // setError("");
    // setLoading(true);
    console.log("id here", id);
    try {
      const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/readinglist`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();
      console.log("data", data);
      
      if (!response.ok) {
          setError(data.message);
          return;
      } 
        
    } catch(err) {
        console.log("error", err);
        alert("Something went wrong. Please try again.");
    } 
    // finally{
    //     setLoading(false);
    // }
  }

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
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
                    <li onClick={()=> addToLibrary(story.id)}>{story.title}</li>
                    {/* <li>{story.rate}</li> */}
                    <li>{story.summary}</li>
                    <li>{story.tags}</li>
                    <li>{story.status}</li>
                    <li>{story.type}</li>
                    <li>{story.likes.length} likes</li>
                    <li>{story.reviews.length} reviews </li>
                    <li>{story.chapters.length} chapters</li>
                    <button onClick={() => navigate(`/stories/${story.id}`)}>
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

export default ProfileStories;
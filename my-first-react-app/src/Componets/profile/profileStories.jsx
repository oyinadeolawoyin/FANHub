// import { useStories } from "../story/storiesContext";
import { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

function ProfileStories() {
  const { id } = useParams();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([])
  
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
    }, 
  []);


  function handleSearch(e) {
      e.preventDefault();
      if (stories) {
          console.log("stories", stories);
          const results = stories.filter(s => s.title.toLowerCase() === search.toLowerCase());
          setSearchResults(results);      
      }
  }

  useEffect(() => {
      if (search.trim() === "") {
        setSearchResults([]);
      }
  }, [search]);
  
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
      <form onSubmit={(e) => handleSearch(e, "story")}>
        <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories by title..."
        />
        <button type="submit">Search Stories</button>
      </form>
      <Stories
          stories={searchResults.length > 0 ? searchResults : stories}
          addToLibrary={addToLibrary}
      />    
    </div>
  );
}

function Stories({ stories, addToLibrary }) {

  const navigate = useNavigate();

  return (
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
                    <li onClick={()=> addToLibrary(story.id)}>{story.title}</li>
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
  )
}

export default ProfileStories;
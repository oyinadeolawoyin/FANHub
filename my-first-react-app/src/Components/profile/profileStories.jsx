import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

function ProfileStories() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryStatus, setLibraryStatus] = useState({}); 

  
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
              
              //Build an object for stories already in library
              const statusMap = {};
              data.stories.forEach((story) => {
                statusMap[story.id] = story.readinglist?.length > 0; // true if in library
              });

              //Update library status state
              setLibraryStatus((prev) => ({
                ...prev,
                ...statusMap,
              }));

          } catch (err) {
            navigate("/error", {
              state: { message: "Network error: Please check your internet connection." },
            });
          } finally {
            setLoading(false);
          }
      };

      fetchStories();
    }, 
  [id]);


  function handleSearch(e) {
      e.preventDefault();
      if (stories) {
          const results = stories.filter(s => s.title.toLowerCase() === search.toLowerCase());
          setSearchResults(results);      
      }
  }

  useEffect(() => {
      if (search.trim() === "") {
        setSearchResults([]);
      }
  }, [search]);
  

  async function addToLibrary(id) {
    setError("");
    setLibraryLoading(true);
    try {
      const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/readinglist`, {
        method: "POST",
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

      
      setLibraryStatus((prev) => ({
        ...prev,
        [id]: !prev[id], // switch between true and false
      }));

    }  catch (err) {
      navigate("/error", {
        state: { message: "Network error: Please check your internet connection." },
      });
    } finally {
      setLibraryLoading(false);
    }
  }

  return (
    <div>
      {loading ? (
        <p>Loading... please wait!</p>
      ): (
        <div>
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
              libraryLoading={libraryLoading}
              libraryStatus={libraryStatus}
          />  
        </div>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}  
    </div>
  );
}

function Stories({ stories, addToLibrary, libraryLoading, libraryStatus }) {
  const navigate = useNavigate();

  return (
    <div>
      {stories.length > 0 ? (
        <ul>
          {stories.map((story) => {
            const isInLibrary = libraryStatus[story.id] || false;
            return (
              <div key={story.id}>
                <p>
                  <img style={{ width: "200px" }} src={story.imgUrl} alt={story.title} />
                </p>
                <p>{story.title}</p>

                <button
                  disabled={libraryLoading === story.id}
                  onClick={() => addToLibrary(story.id)}
                >
                  {libraryLoading === story.id
                    ? "Loading..."
                    : isInLibrary
                    ? "❌ Remove from Library"
                    : "📚 Add to Library"}
                </button>

                <p>{story.summary}</p>
                <p>{story.status}</p>
                <p>{story.type}</p>
                <p>{story.primarygenre} / {story.secondarygenre}</p>
                <p>{story.audience}</p>
                <p>{story.age}</p>
                <p>{story.status}</p>
                <p>{story.type}</p>
                <p>{story._count.views} views</p>
                <p>{story._count.likes} likes</p>
                <p>{story._count.reviews} reviews</p>
                <p>{story._count.chapters} chapters</p>
                <button onClick={() => navigate(`/stories/${story.id}`)}>View</button>
              </div>
            );
          })}
        </ul>
      ) : (
        <p>No Story!</p>
      )}
    </div>
  );
}

export default ProfileStories;
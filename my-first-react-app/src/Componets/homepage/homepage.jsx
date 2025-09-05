import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


function Homepage() {
  const [stories, setStories] = useState(null);
  const [collections, setCollections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
        async function fetchStories() {
            setError("");
            setLoading(true);
            try {
                const response = await fetch(`https://fanhub-server.onrender.com/api/home/stories`, {
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

  useEffect(() => {
          async function fetchCollections() {
              setError("");
              setLoading(true);
              try {
                  const response = await fetch(`https://fanhub-server.onrender.com/api/home/collections`, {
                      method: "GET",
                      credentials: "include",
                  });
          
                  const data = await response.json();
                  console.log("data", data);
                  
                  if (!response.ok) {
                      setError(data.message);
                      return;
                  } 
                  setCollections(data.collections);
                  console.log("collect", collections);
                  
              } catch(err) {
                  console.log("error", err);
                  alert("Something went wrong. Please try again.");
              } finally{
                  setLoading(false);
              }
          };
    
          fetchCollections();
  }, []);

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>loading... please wait!</p>}
      {stories && stories.length > 0 && (
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

                    <button onClick={() => navigate(`/stories/${story.id}`)}>
                      View
                    </button>
                </div>
            ))}
          </ul>
        )
    }

    {collections && collections.length > 0 && (
                <ul>
                    {collections.map((collection) => (
                        <div key={collection.id}>
                            <li>
                                <img 
                                    style={ {width: "200px" } } 
                                    src={collection?.img}
                                />
                            </li>
                            <li>{collection?.name}</li>
                            <li>{collection?.description}</li>
                            <li>{collection?.tags}</li>
                            <li>{collection?.status}</li>

                            <button onClick={() => navigate(`/gallery/${collection.id}`)}>
                            View
                            </button>
                        </div>
                    ))}
                </ul>
            )
        }

    </div>
  );
}

export default Homepage;
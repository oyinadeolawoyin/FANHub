import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ProfileCollections() {
  const [collections, setCollections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

    useEffect(() => {
        async function fetchCollections() {
            setError("");
            setLoading(true);
            try {
                const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/collections`, {
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
      }, 
    []);

  async function addToLibrary(id) {
    // setError("");
    // setLoading(true);
    console.log("id here", id);
    try {
      const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/collection/${id}/readinglist`, {
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
      {collections && collections.length > 0 ? (
          <ul>
            {collections.map((collection) => (
                <div key={collection.id}>
                    <li>
                        <img 
                            style={ {width: "200px" } } 
                            src={collection.img}
                        />
                    </li>
                    <li onClick={() => addToLibrary(collection.id)}>{collection.name}</li>
                    <li>{collection.description}</li>
                    <li>{collection.tags}</li>
                    <li>{collection.status}</li>
                    <li>{collection.likes.length} likes</li>
                    <li>{collection.review.length} reviews </li>
                    <li>{collection.images.length + collection.videos.length} medias </li>
                    <button onClick={() => navigate(`/gallery/${collection.id}`)}>
                      View
                    </button>
                </div>
            ))}
          </ul>
        ) : (
          <div>
              {loading && <p>Loading.... please wait!</p>}
              {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
      )}

    </div>
  );
}

export default ProfileCollections;
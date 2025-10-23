import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Library() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [library, setLibrary] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");
  const [libraryLoadingId, setLibraryLoadingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError("");

  async function fetchUser() {
        try {
          const response = await fetch(`https://fanhub-server.onrender.com/api/users/${id}`, {
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
            
          setLibrary(data.user.readinglist);
          
        } catch(err) {
          navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
          setLoading(false);
        }
    }
    fetchUser();
  }, [id]);

  async function addToLibrary(id, name) {
    setError("");
    setLibraryLoadingId(id);
 
    try {
      const path = name === "stories"
        ? `https://fanhub-server.onrender.com/api/stories/${id}/readinglist`
        : `https://fanhub-server.onrender.com/api/gallery/collection/${id}/readinglist`

      const response = await fetch(path, {
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

      setLibrary(prev => prev.filter(list => Number(list.id) !== Number(id)));
        
    }  catch (err) {
      navigate("/error", {
        state: { message: "Network error: Please check your internet connection." },
      });
    } finally {
      setLibraryLoadingId(null);
    }
  }

  return (
    <div>
         <h1>Library</h1>
        {library ? (
            library.length > 0 ? (
                library.map((library) => (
                <div key={library.id}>
                    <img 
                        style={ {width: "200px" } }
                        src={library.image} 
                        alt="image" 
                    />
                    <li>{library.name}</li>

                    {library.storyId !== null && (
                      <button
                        disabled={libraryLoadingId === library.storyId}
                        onClick={() => addToLibrary(library.storyId, "stories")}
                      >
                        {libraryLoadingId === library.storyId ? "Loading..." : "📚 Remove"}
                      </button>
                    )}

                    {library.collectionId !== null && (
                      <button
                        disabled={libraryLoadingId === library.collectionId}
                        onClick={() => addToLibrary(library.collectionId, "collections")}
                      >
                        {libraryLoadingId === library.collectionId ? "Loading..." : "📚 Remove"}
                      </button>
                    )}
                    
                    <li>{library.tags}</li>
                    <li>{library.description}</li>
                    <li>{library.status}</li>
                    <li>{library.uploadedAt}</li>
                    {library.storyId !== null && <button onClick={() => navigate(`/stories/${library.storyId}`)}>view</button>}
                    {library.collectionId !== null && <button onClick={() => navigate(`/gallery/${library.collectionId}`)}>view</button>}
                </div>
                ))
            ) : (
                <p>No list yet</p>
            )
            ) : (
              <div>
                  {loading && <p>Loading.... please wait!</p>}
                  {error && <p style={{ color: "red" }}>{error}</p>}
              </div>
        )}
    </div>
  );
}

export default Library;
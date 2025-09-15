import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Library() {
  const { id } = useParams();
  const [library, setLibrary] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
          console.log("data", data.user);
  
          if (!response.ok) {
              setError(data.message || "Something is wrong. Try again!");
              return;
          }
          
          setLibrary(data.user.readinglist);
          
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    fetchUser();
  }, []);

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
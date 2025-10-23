import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

function ProfileCollections() {
  const { id } = useParams()
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryStatus, setLibraryStatus] = useState({}); 

  useEffect(() => {
      async function fetchCollections() {
          setError("");
          setLoading(true);
          try {
              const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/collections/${id}`, {
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

              setCollections(data.collections);

              //Build an object for stories already in library
              const statusMap = {};
              data.collections.forEach((collection) => {
                statusMap[collection.id] = collection.readinglist?.length > 0; // true if in library
              });

              //Update library status state
              setLibraryStatus((prev) => ({
                ...prev,
                ...statusMap,
              }));
              
          }  catch (err) {
            navigate("/error", {
              state: { message: "Network error: Please check your internet connection." },
            });
          } finally {
            setLoading(false);
          }
      };

      fetchCollections();
    }, 
  [id]);


  function handleSearch(e) {
      e.preventDefault();
      if (collections) {
          const results = collections.filter(c => c.name.toLowerCase() === search.toLowerCase());
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
      const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/collection/${id}/readinglist`, {
        method: "POST",
        credentials: "include",
      });

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
      {loading ? (<p>Loading... please wait</p>):(
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
          <Collections
              collections={searchResults.length > 0 ? searchResults : collections}
              loading={loading}
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


function Collections({
  collections,
  addToLibrary,
  libraryStatus,
  libraryLoading,
}) {
  const navigate = useNavigate();
  return (
    <div>
      {collections.length > 0 ? (
        <ul>
          {collections.map((collection) => (
            <div key={collection.id}>
              <li>
                <img style={{ width: "200px" }} src={collection.img} />
              </li>
              <li>{collection.name}</li>

              <button
                disabled={libraryLoading}
                onClick={() => addToLibrary(collection.id)}
              >
                {libraryLoading
                  ? "Loading..."
                  : libraryStatus[collection.id]
                  ? "❌ Remove from Library"
                  : "📚 Add to Library"}
              </button>

              <li>{collection.description}</li>
              <li>{collection.tags}</li>
              <li>{collection.status}</li>
              <li>{collection.likes.length} likes</li>
              <li>{collection.review.length} reviews</li>
              <li>
                {collection.images.length + collection.videos.length} medias
              </li>
              <button onClick={() => navigate(`/gallery/${collection.id}`)}>
                View
              </button>
            </div>
          ))}
        </ul>
      ) : (
        <div>
          <p>No collection!</p>
        </div>
      )}
    </div>
  );
}

export default ProfileCollections;
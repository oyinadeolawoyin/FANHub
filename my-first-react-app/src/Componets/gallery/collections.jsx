import Delete from "../delete/delete";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function Collections() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [collections, setCollections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
 
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
            console.log("data", data);
            
            if (!response.ok) {
                setError(data.message);
                return;
            } 
            setCollections(data.collections);
            
        } catch(err) {
            console.log("error", err);
            alert("Something went wrong. Please try again.");
        } finally{
            setLoading(false);
        }
      };

      fetchCollections();
  }, []);

  console.log("collections", collections);
  if (loading) {
    return <div>Loading, please wait...</div>;
  }

  async function handleDelete(id) {
    try{
        const message = await Delete(`https://fanhub-server.onrender.com/api/gallery/collections/${id}`);
        alert(message);
        setCollections(prev => prev.filter(s => s.id !== id));
    } catch(err) {
        console.log("Failed to delete:", err.message);
    } 
  }

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {collections && (
        <div>
          { collections.length > 0 ? (
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
                      <button
                          onClick={() => {
                              const confirmed = window.confirm("Are you sure you want to delete this story?");
                              if (confirmed) {
                              handleDelete(collection.id);
                              }
                          }}
                      >
                          Delete
                      </button>
                      <button onClick={() => navigate(`/dashboard/update collection/${collection.id}`)}>
                          Edit
                      </button>

                      <button onClick={() => navigate(`/dashboard/collections/collection/${collection.id}`)}>
                        View
                      </button>
                  </div>
              ))}
          </ul>
          ) : (
          <p>No Collection found.</p>
        )}
        </div>
      )}
    </div>
  );
}

export default Collections;
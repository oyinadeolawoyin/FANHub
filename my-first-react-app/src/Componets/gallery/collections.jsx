import Delete from "../delete/delete";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function Collections() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [collections, setCollections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletmessage, setDeletemessage] = useState("");
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
            
        } catch (err) {
          navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
            setLoading(false);
        }
      };

      fetchCollections();
  }, [id]);


  async function handleDelete(id) {
    setDeleteLoading(true);
    try{
        const message = await Delete(`https://fanhub-server.onrender.com/api/gallery/collections/${id}`);
        setDeletemessage(message);
        setCollections(prev => prev.filter(s => Number(s.id) !== Number(id)));
    } catch(err) {
      navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
    } finally {
        setDeleteLoading(false);
    }
  }

  return (
    <div>
      {loading ? (
        <p>Loading... please wait</p>
      ):(
        <div>
            {collections && (
              <div>
                { collections.length > 0 ? (
                  <ul>
                    {collections.map((collection) => (
                        <div key={collection.id}>
                            <li>
                                <img 
                                    style={ {width: "200px" } } 
                                    src={collection.img}
                                />
                            </li>
                            <li>{collection.name}</li>
                            <li>{collection.description}</li>
                            <li>{collection.tags}</li>
                            <li>{collection.status}</li>
                            <button type="submit" disabled={deleteLoading}
                                onClick={() => {
                                    const confirmed = window.confirm("Are you sure you want to delete this story?");
                                    if (confirmed) {
                                    handleDelete(collection.id);
                                    }
                                }}
                            >
                              {deleteLoading ? "Loading..." : "Delete" || deletmessage !== "" && {deletmessage} }
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
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}  
    </div>
  );
}

export default Collections;
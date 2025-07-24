import { useCollections } from "./collectionContext";
import Delete from "../delete/delete";
import { useNavigate } from "react-router-dom";

function Collections() {
  const { collections, setCollections, loading, error } = useCollections();
  const navigate = useNavigate();

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
      {collections && collections.length > 0 ? (
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
                    <button onClick={() => navigate(`/update collection/${collection.id}`)}>
                        Edit
                    </button>

                    <button onClick={() => navigate(`/collections/${collection.id}`)}>
                      View
                    </button>
                </div>
            ))}
          </ul>
        ) : (
        <p>No Collection found.</p>
      )}

    </div>
  );
}

export default Collections;
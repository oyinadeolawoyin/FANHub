import { useCollections } from "../gallery/collectionContext";
import { useNavigate } from "react-router-dom";

function ProfileCollections() {
  const { collections, loading, error } = useCollections();
  const navigate = useNavigate();

  console.log("collections", collections);
  if (loading) {
    return <div>Loading, please wait...</div>;
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
                    <li>{collection?.likes.length} likes</li>
                    <li>{collection?.review.length} reviews </li>
                    <li>{collection?.images.length + collection?.videos.length} medias </li>
                    <button onClick={() => navigate(`/gallery/${collection.id}`)}>
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

export default ProfileCollections;
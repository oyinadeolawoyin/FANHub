import { useStories } from "./storiesContext";
import Delete from "../delete/delete";
import { useNavigate } from "react-router-dom";
import { useImages } from "../gallery/imagesContext";


function Stories() {
  const { stories, setStories, loading, error } = useStories();
  const navigate = useNavigate();
  const { images } = useImages();
  console.log('stoyiii', images);

  if (loading) {
    return <div>Loading, please wait...</div>;
  }

  async function handleDelete(id) {
    try{
        const message = await Delete(`https://fanhub-server.onrender.com/api/stories/${id}`);
        alert(message);
        setStories(prev => prev.filter(s => s.id !== id));
    } catch(err) {
        console.log("Failed to delete:", err.message);
    } 
  }

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {stories && stories.length > 0 ? (
            <ul>
            {stories.map((story) => (
                <div key={story.id}>
                    <li>
                        <img 
                            style={
                                {
                                width: "200px"}} 
                                src={story.imgUrl}
                        />
                    </li>
                    <li>{story.title}</li>
                    <li>{story.summary}</li>
                    <li>{story.tags}</li>
                    <li>{story.status}</li>
                    <button
                        onClick={() => {
                            const confirmed = window.confirm("Are you sure you want to delete this story?");
                            if (confirmed) {
                            handleDelete(story.id);
                            }
                        }}
                    >
                        Delete
                    </button>
                    <button onClick={() => navigate(`/update-story/${story.id}`)}>
                        Edit
                    </button>

                    <button onClick={() => navigate(`/story/${story.id}`)}>
                      View
                    </button>
                </div>
            ))}
          </ul>
        ) : (
        <p>No Story found.</p>
      )}

    </div>
  );
}

export default Stories;
import { useStories } from "../story/storiesContext";
import { useNavigate } from "react-router-dom";

function ProfileStories() {
  const { stories, loading, error } = useStories();
  const navigate = useNavigate();
  console.log("stories",stories);
  if (loading) {
    return <div>Loading, please wait...</div>;
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
                            style={ {width: "200px" } } 
                            src={story.imgUrl}
                        />
                    </li>
                    <li>{story.title}</li>
                    {/* <li>{story.rate}</li> */}
                    <li>{story.summary}</li>
                    <li>{story.tags}</li>
                    <li>{story.status}</li>
                    <li>{story.type}</li>
                    <li>{story.likes.length} likes</li>
                    <li>{story.reviews.length} reviews </li>
                    <li>{story.chapters.length} chapters</li>
                    <button onClick={() => navigate(`/stories/${story.id}`)}>
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

export default ProfileStories;
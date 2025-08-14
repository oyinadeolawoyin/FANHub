import { useStories } from "../story/storiesContext";
import { useCollections } from "../gallery/collectionContext";
import { useNavigate } from "react-router-dom";

function Homepage() {
  const { stories, loading, error } = useStories();
  const { collections } = useCollections();
  const navigate = useNavigate();

  if (loading) {
    return <div>Loading, please wait...</div>;
  }

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {stories && stories.length > 0 && (
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
                    <li>{story.summary}</li>
                    <li>{story.tags}</li>
                    <li>{story.status}</li>
                    <li>{story.type}</li>

                    <button onClick={() => navigate(`/stories/${story.id}`)}>
                      View
                    </button>
                </div>
            ))}
          </ul>
        )
    }
    {collections && collections.length > 0 && (
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

                            <button onClick={() => navigate(`/collections/${collection.id}`)}>
                            View
                            </button>
                        </div>
                    ))}
                </ul>
            )
        }

    </div>
  );
}

export default Homepage;
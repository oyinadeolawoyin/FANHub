import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useStories } from "./storiesContext";
import Delete from "../delete/delete";

function StoryPage() {
    const { id } = useParams();
    const { stories } = useStories();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [chapters, setChapters] = useState("");
    
    const story = stories.find(storyElement => storyElement.id == id);

    useEffect(() => {
        setLoading(false);
        setError("");

        async function fetchChapters() {
            try {
                const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/chapters`, {
                    method: "GET",
                    credentials: "include",
                });
                
                const data = await response.json();
        
                if (!response.ok) {
                    setError(data.message || "Something is wrong. Try again!");
                    return;
                }
        
                
                setChapters(data.chapters);
        
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    fetchChapters();

    }, []);

    async function handleDelete(id) {
        try{
            const message = await Delete(`https://fanhub-server.onrender.com/api/stories/${story.id}/chapters/${id}`);
            alert(message);
            setChapters(prev => prev.filter(s => s.id !== id))
        } catch(err) {
            console.log("Failed to delete:", err.message);
        } 
    }
    
    console.log("chap", chapters);
    if (!story) {
        return <p>Story not found</p>;
    }

    return (
        <div>
            <header>
                <li><img style={{ width: "200px" }} src={story.imgUrl} /></li>
                <li>{story.title}</li>
                <li>{story.summary}</li>
                <li>{story.type}</li>
                <li>{story.tags}</li>
                <li>{story.likes}</li>
                <li>{story.status}</li>
                <li>likes: {story.likes.length}</li>
                <li>Reviews: {story.reviews.length}</li>
            </header>

            <main>
                <div>
                    <button onClick={() => navigate(`/story/${story.id}/create-chapter`)}>
                        New chapter
                    </button>
                </div>
                {chapters.length > 0 ? (
                chapters.map(chapter => (
                    <div key={chapter.id}>
                        <li onClick={() => navigate(`/story/chapters/${chapter.id}`)}>{chapter.title} uploadedAt: {chapter.uploadedAt} likes: {chapter.likes.length} comments: {chapter.comments.length}</li>
                        <button
                            onClick={() => {
                                const confirmed = window.confirm("Are you sure you want to delete this chapter?");
                                if (confirmed) {
                                handleDelete(chapter.id);
                                }
                            }}
                        >
                            Delete
                        </button>
                    </div>
                ))
                ) : (
                <p>No chapters yet!</p>
                )}
                {loading && <p>Loading...please wait</p>}
                {error && <p>{error}</p>}
            </main>
        </div>
    );
}

export default StoryPage;
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Delete from "../delete/delete";

function StoryPage() {
    const { id } = useParams();
    const [story, setStory] = useState(null);
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [chapters, setChapters] = useState("");
    
    useEffect(() => {
        async function fetchStory() {
            console.log("i'm in here.....")
            setError("");
            setLoading(true);
            try {
                const response = await fetch(`https://fanhub-server.onrender.com/api/stories/story/${id}`, {
                    method: "GET",
                    credentials: "include",
                });
        
                const data = await response.json();
                console.log("data", data);
                
                if (!response.ok) {
                    setError(data.message);
                    return;
                } 
                setStory(data.story);
                console.log("storyy", data.story);
                
            } catch(err) {
                console.log("error", err);
                alert("Something went wrong. Please try again.");
            } finally{
                setLoading(false);
            }
        };

        fetchStory();
    }, [id]);

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

    return (
        <div>
            {story && (
                <div>
                    <header>
                        <li><img style={{ width: "200px" }} src={story.story.imgUrl} /></li>
                        <li>{story.story.title}</li>
                        <li>{story.story.summary}</li>
                        <li>{story.story.type}</li>
                        <li>{story.story.tags}</li>
                        <li>{story.story.status}</li>
                        <li>Likes: {story.likes.length}</li> 
                        <li>Reviews: {story.story.reviews.length}</li> 
                    </header>

                    <main>
                        <div>
                            <button onClick={() => navigate(`/dashboard/story/${story.story.id}/create chapter`)}>
                                New chapter
                            </button>
                        </div>
                        {chapters.length > 0 ? (
                        chapters.map(chapter => (
                            <div key={chapter.chapter.id}>
                                <li onClick={() => navigate(`/stories/${story.story.id}/chapters/${chapter.chapter.id}`)}>title: {chapter.chapter.title} uploadedAt: {chapter.chapter.uploadedAt} likes: {chapter.likes.length} comments: {chapter.comments.length} status:  {chapter.chapter.status}</li>
                                <button
                                    onClick={() => {
                                        const confirmed = window.confirm("Are you sure you want to delete this chapter?");
                                        if (confirmed) {
                                        handleDelete(chapter.chapter.id);
                                        }
                                    }}
                                >
                                    Delete
                                </button>
                                <button onClick={() => navigate(`/dashboard/story/${story.story.id}/update chapter/${chapter.chapter.id}`)}>
                                    Edit
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
            )}
        </div>
    );
}

export default StoryPage;
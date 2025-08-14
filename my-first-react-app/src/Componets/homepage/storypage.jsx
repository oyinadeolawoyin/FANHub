import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useStories } from "../story/storiesContext";

function HomeStoryPage() {
    const { id } = useParams();
    const { stories } = useStories();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [chapters, setChapters] = useState("");
    const [likes, setLikes] = useState("");
    
    const story = stories.find(storyElement => storyElement.id == id);
    if(!story) setLoading(true);

    useEffect(() => {
        if (story) {
            setLoading(false);
            setLikes(story.likes);
        }
    }, [story]);

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


    async function likeStroy(e) {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${story.id}/like/love`, {
                method: "POST",
                credentials: "include",
            });
    
            const data = await response.json();
            console.log("data", data);
            if (!response.ok) {
                setError(data.message || "Something is wrong. Try again!");
                return;
            } 
            alert("liked!");
            setLikes(prev => [...prev, data.liked]);
    
             
        } catch(err) {
            console.log("error", err);
            alert("Something went wrong. Please try again.");
        }
    };

    console.log("chap", chapters);

    return (
        <div>
             {loading && <p>Loading...please wait</p>}
             {error && <p>{error}</p>}
            <header>
                <li><img style={{ width: "200px" }} src={story.imgUrl} /></li>
                <li>{story.title}</li>
                <li>{story.user.username}</li>
                <li>{story.type}</li>
                <li>{story.tags}</li>
                <li>{story.status}</li>
                <li>
                    <button onClick={likeStroy}>
                        ❤️ {likes.length} {story.likes.length === 1 ? "Like" : "Likes"}
                    </button>
                </li>
                <li onClick={() => navigate(`/stories/${story.id}/reviews`)}>{story.reviews.length} {story.reviews.length === 1 ? "Review" : "Reviews"}</li>
                <li>
                    <button onClick={() => navigate(`/review/${story.id}`)}>
                        ❤️ write a review 
                    </button>
                </li>
                <li><b>Synopsis:</b> {story.summary}</li>
            </header>

            <main>
                {chapters.length > 0 && (
                    chapters.map(chapter => (
                        <div key={chapter.chapter.id}>
                            <li onClick={() => navigate(`/stories/${story.id}/chapters/${chapter.chapter.id}`)}><b>Title:</b>{chapter.chapter.title} <b>uploadedAt:</b> {chapter.chapter.uploadedAt}</li>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}

export default HomeStoryPage;
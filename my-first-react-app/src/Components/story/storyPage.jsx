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
    const [chapterLoading, setChapterLoading] = useState(false);
    const [chapters, setChapters] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [deletmessage, setDeletemessage] = useState("");
    
    useEffect(() => {
        async function fetchStory() {
            setError("");
            setLoading(true);
            try {
                const response = await fetch(`https://fanhub-server.onrender.com/api/stories/story/${id}`, {
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

                setStory(data.story);
           
            } catch(err) {
                navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
            } finally {
                setLoading(false);
            }
        };

        fetchStory();
    }, [id]);

    useEffect(() => {
        setChapterLoading(true);
        setError("");

        async function fetchChapters() {
            try {
                const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/chapters`, {
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
                
                setChapters(data.chapters);
        
            } catch(err) {
                navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
            } finally {
                setChapterLoading(false);
            }
    }
    fetchChapters();

    }, [id]);

    async function handleDelete(id) {
        setDeletingId(id);
        try{
            const message = await Delete(`https://fanhub-server.onrender.com/api/stories/${story.id}/chapters/${id}`);
            setDeletemessage(message);
            setChapters(prev => prev.filter(s => Number(s.id) !== NUmber(id)))
        } catch(err) {
            navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div> 
            {loading ? (
                <p>Loading...please wait</p>
            ) : (
                <div>
                    {story && (
                        <div>
                            <header>
                                <li><img style={{ width: "200px" }} src={story.imgUrl} /></li>
                                <li>{story.title}</li>
                                <li>{story.summary}</li>
                                <li>{story.type}</li>
                                <li>Genres: {story.primarygenre} / {story.secondarygenre}</li>
                                <li>Subgenres: {story.primarysubgenre.join(" , ")} / {story.secondarysubgenre.join(" , ")}</li>
                                <li>{story.status}</li>
                                <li>Warning: {story.warnings.join(" , ")}</li>
                                <li>Audience: {story.audience}</li>
                                <li>Story Age: {story.age}</li>
                                <li>Likes: {story._count.likes}</li> 
                                <li>Reviews: {story._count.reviews}</li> 
                            </header>

                            <main>
                                <div>
                                    <button onClick={() => navigate(`/dashboard/story/${story.id}/create chapter`)}>
                                        New chapter
                                    </button>
                                </div>

                                {chapterLoading ? (
                                    <p>Loading... please wait!</p>
                                ) : (
                                    <div>
                                        {chapters.length > 0 ? (
                                            chapters.map(chapter => (
                                                <div key={chapter.id}>

                                                    <li onClick={() => navigate(`/stories/${story.id}/chapters/${chapter.id}`)}>title: {chapter.title} uploadedAt: {chapter.uploadedAt} Views: {chapter._count.view} likes: {chapter._count.likes} comments: {chapter._count.comments} status:  {chapter.status}</li>

                                                    <button type="submit"  disabled={deletingId === chapter.id}
                                                        onClick={() => {
                                                            const confirmed = window.confirm("Are you sure you want to delete this chapter?");
                                                            if (confirmed) {
                                                            handleDelete(chapter.id);
                                                            }
                                                        }}
                                                    >
                                                        {deletingId === story.id ? "Loading..." : "Delete" || deletmessage !== "" && {deletmessage} }
                                                    </button>
                                                    <button onClick={() => navigate(`/dashboard/story/${story.id}/update chapter/${chapter.id}`)}>
                                                        Edit
                                                    </button>
                                                </div>
                                            ))
                                            ) : (
                                                <p>No chapters yet!</p>
                                            )}
                                    </div>
                                )}
                            </main>
                        </div>
                    )}
                </div>
            )}
            {error && <p>{error}</p>}  
        </div>
    );
}

export default StoryPage;
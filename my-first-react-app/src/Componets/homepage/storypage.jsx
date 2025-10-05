import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";

function HomeStoryPage() {
    const { user } = useAuth();
    const { id } = useParams();
    const [story, setStory] = useState(null);
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [chaperror, setChapError] = useState("");
    const [chaploading, setChapLoading] = useState(false);
    const [chapters, setChapters] = useState("");
    const [likes, setLikes] = useState("");

    useEffect(() => {
        if (story) {
            setLoading(false);
            setLikes(story.likes);
        }
    }, [story]);

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
                console.log("stories", data.story);
                
            } catch(err) {
                console.log("error", err);
                alert("Something went wrong. Please try again.");
            } finally{
                setLoading(false);
            }
        };

        fetchStory();
    }, 
    [id]);

    useEffect(() => {
        setChapLoading(false);
        setError("");

        async function fetchChapters() {
            try {
                const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/chapters`, {
                    method: "GET",
                    credentials: "include",
                });
                
                const data = await response.json();
        
                if (!response.ok) {
                    setChapError(data.message || "Something is wrong. Try again!");
                    return;
                }
        
                
                setChapters(data.chapters);
        
            } catch (err) {
                setError(err.message);
            } finally {
                setChapLoading(false);
            }
        }
    fetchChapters();

    }, []);


    async function likeStroy(e) {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/like/love`, {
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
            if (data.like) {
                setLikes(prev => prev.filter(like => like.userId !== data.userId));
            } else {
                setLikes(prev => [...prev, data]);
            }         
            
            if (data.liked) {
                const socialResponse = await fetch(`https://fanhub-server.onrender.com/api/users/${id}/social/likepoint`, {
                    method: "POST",
                    credentials: "include",
                });
    
                const socialData = await socialResponse.json();
                if (!socialResponse.ok) {
                    setError(socialData.message || "Something is wrong. Try again!");
                    return;
                }     
            } 
             
        } catch(err) {
            console.log("error", err);
            alert("Something went wrong. Please try again.");
        }
    };


    async function addToLibrary(id) {
        // setError("");
        // setLoading(true);
        console.log("id here", id);
        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/readinglist`, {
            method: "POST",
            credentials: "include",
            });

            const data = await response.json();
            console.log("data", data);
            
            if (!response.ok) {
                setError(data.message);
                return;
            } 
            
        } catch(err) {
            console.log("error", err);
            alert("Something went wrong. Please try again.");
        } 
        // finally{
        //     setLoading(false);
        // }
    }

    async function view(chapterId) {
         // setError("");
        // setLoading(true);
        // console.log("id here", id);
        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/chapters/${chapterId}/view`, {
            method: "POST",
            credentials: "include",
            })
            
            const data = await response.json();
            console.log("data", data);

            if (!response.ok) {
                setError(data.message);
                return;
            } 
        
            const socialResponse = await fetch(`https://fanhub-server.onrender.com/api/users/${id}/social/readingpoint`, {
                method: "POST",
                credentials: "include",
            });

            const socialData = await socialResponse.json();
            console.log("soc", socialData);   
            
            // if (!socialResponse.ok) {
            // const errorData = await socialResponse.json().catch(() => ({}));
            // setError(errorData.message || "Something is wrong. Try again!");
            // return;
            // }

            if (!socialResponse.ok) {
                setError(data.message);
                return;
            } 
            
            const streakRes = await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/readingStreak`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            
            const streakData = await streakRes.json();
            console.log("streak", streakData);

            if (!streakRes.ok) {
                const errData = await streakRes.json();
                console.warn("Streak update failed:", errData.message || "Unknown error");
            }
      
        } catch(err) {
            console.log("error", err);
            alert("Something went wrong. Please try again.");
        } 
        // finally{
        //     setLoading(false);
        // }
    }

    console.log("chap", chapters);

    return (
        <div>
            {story ?(
                <header>
                    <li><img style={{ width: "200px" }} src={story.story.imgUrl} /></li>
                    <li>{story.story.title}</li>
                    <li onClick={() => navigate(`/profile/${story.story.user.username}/${story.story.userId}`)}>{story.story.user.username}</li>
                    <li>{story.story.type}</li>
                    <li>{story.story.tags}</li>
                    <li>{story.story.status}</li>
                    <li>
                        <button onClick={likeStroy}>
                            ❤️ {likes.length} {likes.length === 1 ? "Like" : "Likes"}
                        </button>
                    </li>
                    <li onClick={()=> addToLibrary(story.story.id)}>Add to Library</li>
                    <li onClick={() => navigate(`/stories/${story.story.id}/reviews`)}>{story.story.reviews.length} {story.story.reviews.length === 1 ? "Review" : "Reviews"}</li>
                    <li>
                        <button onClick={() => navigate(`/stories/${story.story.id}/review`)}>
                            ❤️ write a review 
                        </button>
                    </li>
                    <li><b>Synopsis:</b> {story.story.summary}</li>
                </header>
                ) :(
                    <div>
                        {loading && <p>Loading...please wait</p>}
                        {error && <p>{error}</p>}
                    </div>
                )
            }

            <main>
                {chapters.length > 0 ? (
                    chapters.map(chapter => (
                        <div key={chapter.chapter.id}>
                            <li onClick={() => {
                                view(chapter.chapter.id);
                                navigate(`/stories/${story.story.id}/chapters/${chapter.chapter.id}`);
                            }}>
                                <b>Title:</b>{chapter.chapter.title} <b>uploadedAt:</b> {chapter.chapter.uploadedAt}
                            </li>
                        </div>
                    ))
                ):(
                    <div>
                        {chaploading && <p>Loading...please wait</p>}
                        {chaperror && <p>{chaperror}</p>}
                    </div>
                )}
            </main>
        </div>
    );
}

export default HomeStoryPage;
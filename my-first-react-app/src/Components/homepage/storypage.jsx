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
    const [chaploading, setChapLoading] = useState(false);
    const [chapters, setChapters] = useState("");
    const [libraryLoading, setLibraryLoading] = useState(false);
    const [libraryStatus, setLibraryStatus] = useState({}); 
    const [likeLoading, setLikeLoading] = useState(false);


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
                console.log("data", data);
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
               
                setLibraryStatus((prev) => ({
                    ...prev,
                    [data.story.id]: data.story.library?.length > 0,
                }));
                       
            } catch(err) {
                navigate("/error", { state: { message:  err.message
                    // "Network error: Please check your internet connection."
                 } });
            } finally {
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
                console.log("cha", data);
            } catch(err) {
                navigate("/error", { state: { message:  err.message
                    // "Network error: Please check your internet connection." 
                } });
            } finally {
                setLoading(false);
            }
        }
    fetchChapters();

    }, [id]);

    async function likeStory(e) {
        e.preventDefault();
        setError("");
        setLikeLoading(true);
      
        try {
          const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/like/love`, {
            method: "POST",
            credentials: "include",
          });
      
          const data = await response.json();
      
          if (response.status === 500) {
            navigate("/error", { state: { message: data.message || "Process failed" } });
            return;
          } else if (!response.ok) {
            setError(data.message);
            return;
          }
      
          // Update story state locally
          setStory(prevStory => {
            const likesData = data.message === "Liked!" ? 1 : -1;
            const userLiked = data.message === "Liked!";
      
            return {
              ...prevStory,
              _count: {
                ...prevStory._count,
                likes: prevStory._count.likes + likesData,
              },
              likedByCurrentUser: userLiked,
            };
          });
      
          // If user liked, update social points
          if (data.message === "Liked!") {
            const socialResponse = await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/social/likepoint`, {
              method: "POST",
              credentials: "include",
            });
      
            if (!socialResponse.ok) {
              const errData = await socialResponse.json();
              setError(errData.message || "Something went wrong with like points!");
            }
          }
      
        } catch(err) {
          navigate("/error", { state: { message: err.message } });
        } finally {
          setLikeLoading(false);
        }
    }

    async function addToLibrary(id) {
        setError("")
        setLibraryLoading(true);

        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/readinglist`, {
            method: "POST",
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
            
            setLibraryStatus((prev) => ({
                ...prev,
                [id]: !prev[id], // switch between true and false
            }));
            
        } catch(err) {
            navigate("/error", { state: { message:  err.message
                // "Network error: Please check your internet connection." 
            } });
        } finally {
            setLibraryLoading(false);
        }
    }

    async function view(chapterId) {
        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/chapters/${chapterId}/view`, {
            method: "POST",
            credentials: "include",
            })
            
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
        
            const socialResponse = await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/social/readingpoint`, {
                method: "POST",
                credentials: "include",
            });

            if (!socialResponse.ok) {
                const errData = await streakRes.json();
                setError(errData.message);
                return;
            } 
            
            const streakRes = await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/readingStreak`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (!streakRes.ok) {
                const errData = await streakRes.json();
                setError(errData.message);
                return;
            }
      
        } catch(err) {
            navigate("/error", { state: { message:  err.message
                // "Network error: Please check your internet connection."
             } });
        } 
    }

    return (
        <div>
            {!story || loading ? (
                <p>Loading... please wait!</p>
            ) : (
            <div>
                <header>
                    <li>
                        <img style={{ width: "200px" }} src={story.imgUrl} alt={story.title} />
                    </li>
                    <li>{story.title} {story._count.views} views</li>
                    <li onClick={() => navigate(`/profile/${story.user.username}/${story.userId}/about`)}>
                        {story.user.username}
                    </li>
                    <li>Genres: {story.primarygenre} / {story.secondarygenre}</li>
                    <li>Subgenres: {story.primarysubgenre.join(" , ")} / {story.secondarysubgenre.join(" , ")}</li>
                    <li>{story.status}</li>
                    <li>Warning: {story.warnings.join(" , ")}</li>
                    <li>{story.audience}</li>
                    <li>{story.age}</li>
                    <li>{story.type}</li>
                    <li>{story.status}</li>

                    <li>
                        <button onClick={likeStory} disabled={likeLoading}>
                            {story.likedByCurrentUser ? "❤️ Liked" : "🤍 Like"} {story._count.likes}
                        </button>
                    </li>

                    <li>
                        <button
                        disabled={libraryLoading === story.id}
                        onClick={() => addToLibrary(story.id)}
                        >
                        {libraryLoading === story.id
                            ? "Loading..."
                            : libraryStatus[story.id]
                            ? "❌ Remove from Library"
                            : "📚 Add to Library"}
                        </button>
                    </li>

                    <li onClick={() => navigate(`/stories/${story.id}/reviews`)}>
                        {story._count.reviews} {story._count.reviews === 1 ? "Review" : "Reviews"}
                    </li>

                    <li>
                        <button onClick={() => navigate(`/stories/${story.id}/review`)}>
                        ❤️ Write a Review
                        </button>
                    </li>

                    <li><b>Synopsis:</b> {story.summary}</li>
                </header>
            </div>
            )}

            {chaploading ? (
                <p>Loading... please wait!</p>
                ) : (
                <main>
                    {chapters && chapters.map(chapter => (
                    <div key={chapter.id}>
                        <li
                        onClick={() => {
                            view(chapter.id);
                            navigate(`/stories/${story.id}/chapters/${chapter.id}`);
                        }}
                        >
                        <b>Title:</b> {chapter.title}{" "}
                        <b>UploadedAt:</b> {chapter.uploadedAt}
                        </li>
                    </div>
                    ))}
                </main>
            )}
            {error && <p>{error}</p>}
        </div>
    );

}

export default HomeStoryPage;
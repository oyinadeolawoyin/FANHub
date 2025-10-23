import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import CommentList from "../comment/commentList";

function Chapter() {
    const { storyId, chapterId } = useParams();
    const { user } = useAuth();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const [chapter, setChapter] = useState("");
    
    useEffect(() => {
        setLoading(true);
        setError("");
    
        async function fetchChapter() {
            try {
                const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${storyId}/chapters/${chapterId}`, {
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

                setChapter(data.chapter);
                console.log("cha", data);
    
            } catch(err) {
                navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
            } finally {
                setLoading(false);
            }
        }
    
        fetchChapter();
    }, [storyId, chapterId]);    

    async function likeChapter(e, like) {
        e.preventDefault();
        setError("");
      
        try {
          const response = await fetch(
            `https://fanhub-server.onrender.com/api/stories/${storyId}/chapters/${chapterId}/like/${like}`,
            {
              method: "POST",
              credentials: "include",
            }
          );
      
          const data = await response.json();
      
          if (response.status === 500) {
            navigate("/error", {
              state: { message: data.message || "Process failed" },
            });
            return;
          } else if (!response.ok && response.status !== 500) {
            setError(data.message);
            return;
          }
      
          //Update specific reaction count locally
          setChapter((prev) => {
            const isLike = data.message === "Liked!";
            const change = isLike ? 1 : -1;
      
            return {
              ...prev,
              reactionCounts: {
                ...prev.reactionCounts,
                [like]: (prev.reactionCounts?.[like] || 0) + change, //increment or decrement only the clicked reaction
              },
              likedByCurrentUser: isLike,
            };
          });
      
          //Update social points if user liked
          if (data.message === "Liked!") {
            const socialResponse = await fetch(
              `https://fanhub-server.onrender.com/api/users/${user.id}/social/likepoint`,
              {
                method: "POST",
                credentials: "include",
              }
            );
      
            if (!socialResponse.ok) {
              const errData = await socialResponse.json();
              setError(
                errData.message || "Something went wrong with like points!"
              );
            }
          }
        } catch (err) {
          navigate("/error", {
            state: {
              message: "Network error: Please check your internet connection.",
            },
          });
        }
    }
        
    return (
        <div>
            {error && <p>{error}</p>}
            {!chapter || loading ? (
                <p>Loading... please wait</p>
            ):(
                <div>
                    <div>
                        <header>
                            <h1><b>{chapter.title}</b></h1>
                        </header>
                        <div>
                            <p>{chapter.content}</p>
                        </div>
                    </div>
                    <ul>
                        <li>
                            <button onClick={(e) => likeChapter(e, "lovethis")}>❤️ Love this {chapter.reactionCounts?.lovethis || 0}</button>
                        </li>
                        <li>
                            <button onClick={(e) => likeChapter(e, "funny")}>😂 Funny {chapter.reactionCounts?.funny || 0}</button>
                        </li>
                        <li>
                            <button onClick={(e) => likeChapter(e, "suspenseful")}>😱 Suspenseful {chapter.reactionCounts?.suspenseful || 0}</button>
                        </li>
                        <li>
                            <button onClick={(e) => likeChapter(e, "emotional")}>😢 Emotional {chapter.reactionCounts?.emotional || 0}</button>
                        </li>
                        <li>
                            <button onClick={(e) => likeChapter(e, "profound")}>🧠 Profound {chapter.reactionCounts?.profound || 0}</button>
                        </li>
                        <li>
                            <button onClick={(e) => likeChapter(e, "heartwarming")}>🥰 Heartwarming {chapter.reactionCounts?.heartwarming || 0}</button>
                        </li>
                        <li>
                            <button onClick={(e) => likeChapter(e, "shocking")}>🤯 Shocking {chapter.reactionCounts?.shocking || 0}</button>
                        </li>
                        <li>
                            <button onClick={(e) => likeChapter(e, "goodwriting")}>✍️ Good Writing {chapter.reactionCounts?.goodwriting || 0}</button>
                        </li>
                        <li>
                            <button onClick={(e) => likeChapter(e, "goodcharacters")}>👥 Good Characters {chapter.reactionCounts?.goodcharacters || 0}</button>
                        </li>
                        <li><
                            button onClick={(e) => likeChapter(e, "compellingplot")}>📚 Compelling Plot {chapter.reactionCounts?.compellingplot || 0}</button>
                        </li>
                        <li>
                            <button onClick={(e) => likeChapter(e, "strongdialogue")}>🗣️ Strong Dialogue {chapter.reactionCounts?.strongdialogue || 0}</button>
                        </li>
                    </ul>
                </div>
            )}

            <section className="comments-section">
                <h3>Comments</h3>
                <CommentList chapterId={chapter.id} storyId={storyId} contentOwnerId={chapter.userId}/>
            </section>
        </div>
    );
}


export default Chapter;
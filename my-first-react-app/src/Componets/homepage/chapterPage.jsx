import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Delete from "../delete/delete";
import { useAuth } from "../auth/authContext";

function Chapter() {
    const { storyId, chapterId } = useParams();
    const { user } = useAuth();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const [chapter, setChapter] = useState("");
    const [comments, setComments] = useState([]);
    const [form, setForm] = useState({ content: "" });
    const [replyingTo, setReplyingTo] = useState({ id: null, username: "" });

    const [lovethis, setLovethis] = useState([]);
    const [funny, setFunny] = useState([]);
    const [suspenseful, setSuspensful] = useState([]);
    const [emotional, setEmotional] = useState([]);
    const [profound, setProfound] = useState([]);
    const [heartwarming, setHeartwarming] = useState([]);
    const [shocking, setShocking] = useState([]);
    const [goodwriting, SetGoodwriting] = useState([]);
    const [goodcharacters, setGoodcharacters] = useState([]);
    const [strongdialogue, setStrongdialogue] = useState([]);
    const [compellingplot, setCompellingplot] = useState([]);

    console.log("commmm", comments);
    useEffect(() => {
        if (!chapter || !chapter.likes) return;
    
        // Create temporary arrays
        const lovethis = [];
        const funny = [];
        const suspenseful = [];
        const emotional = [];
        const profound = [];
        const heartwarming = [];
        const shocking = [];
        const goodwriting = [];
        const goodcharacters = [];
        const strongdialogue = [];
        const compellingplot = [];
    
        for (let x of chapter.likes) {
            switch (x.like) {
                case "lovethis":
                    lovethis.push(x);
                    break;
                case "funny":
                    funny.push(x);
                    break;
                case "suspenseful":
                    suspenseful.push(x);
                    break;
                case "emotional":
                    emotional.push(x);
                    break;
                case "profound":
                    profound.push(x);
                    break;
                case "heartwarming":
                    heartwarming.push(x);
                    break;
                case "shocking":
                    shocking.push(x);
                    break;
                case "goodwriting":
                    goodwriting.push(x);
                    break;
                case "goodcharacters":
                    goodcharacters.push(x);
                    break;
                case "strongdialogue":
                    strongdialogue.push(x);
                    break;
                case "compellingplot":
                    compellingplot.push(x);
                    break;
                default:
                    break;
            }
        }
    
        setLovethis(lovethis);
        setFunny(funny);
        setSuspensful(suspenseful);
        setEmotional(emotional);
        setProfound(profound);
        setHeartwarming(heartwarming);
        setShocking(shocking);
        SetGoodwriting(goodwriting);
        setGoodcharacters(goodcharacters);
        setStrongdialogue(strongdialogue);
        setCompellingplot(compellingplot);
    
    }, [chapter]);
    

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
    
                if (!response.ok) {
                    setError(data.message || "Something is wrong. Try again!");
                    return;
                }
                console.log("chap", data.chapter);
                setChapter(data.chapter);
                setComments(data.chapter.topLevelComments);
                setReply(data.chapter.comment.replies);
    
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
    
        fetchChapter();
    }, [storyId, chapterId]);    


    async function likeChapter(e, like) {
        console.log("like", like);
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${storyId}/chapters/${chapterId}/like/${like}`, {
                method: "POST",
                credentials: "include",
            });
    
            const data = await response.json();
            if (!response.ok) {
                setError(data.message || "Something is wrong. Try again!");
                return;
            } 
            console.log("data", data);

            const setterMap = {
                lovethis: setLovethis,
                funny: setFunny,
                suspenseful: setSuspensful,
                emotional: setEmotional,
                profound: setProfound,
                heartwarming: setHeartwarming,
                shocking: setShocking,
                goodwriting: SetGoodwriting,
                goodcharacters: setGoodcharacters,
                compellingplot: setCompellingplot,
                strongdialogue: setStrongdialogue,
            };
           
            const setter = setterMap[like];
            if (!setter) return;
    
            // if (data.like) {
            //     // Unlike: remove this user's like from the corresponding state
            //     setter(prev => prev.filter(like => like.userId !== data.like.userId));
            //     alert("Removed like!");
            // } else if (data.liked) {
            //     // Like: add the new like to the corresponding state
            //     setter(prev => [...prev, data.liked]);
            //     alert("Liked!");
            // }

            if (!data.liked) {
                // Unlike
                setter(prev => prev.filter(l => l.userId !== data.like.userId));
            
                // Also remove from chapter.likes
                setChapter(ch => ({
                    ...ch,
                    likes: ch.likes.filter(like => !(like.userId === data.userId && like.like === data.like))
                }));
                alert("Removed like!");
            } else if (data.liked) {
                // Like
                setter(prev => [...prev, data.liked]);
            
                // Also add to chapter.likes
                setChapter(ch => ({
                    ...ch,
                    likes: [...ch.likes, data.liked]
                }));
                alert("Liked!");
            }            
            
            
             
        } catch(err) {
            console.log("error", err);
            alert("Something went wrong. Please try again.");
        }
    };

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prevForm => ({
          ...prevForm,
          [name]: value
        }));
    }    

    async function writeComment(e) {
        e.preventDefault();
        setLoading(false);
        setError("");

        try {
            const replyContent = `@${user.username} ${form.content}`;
            const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${storyId}/chapters/${chapterId}/post-comment`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: replyContent }),
                    credentials: "include",
                }
            );
    
            const data = await response.json();
            console.log("data", data);
            if (!response.ok) {
                setError(data.message || "Something is wrong. Try again!");
                return;
            } 
            alert("comment post");
            console.log("com", data);
            setComments(prev => [...prev, data.comment]);
            setForm({ content: "" });
            console.log("commm", comments);
             
        } catch(err) {
            console.log("error", err);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    async function writeReply(e, commentId) {
        e.preventDefault();
        setError("");

        try {
            const replyContent = `@${user.username} ${form.content}`;
            const response = await fetch(
                `https://fanhub-server.onrender.com/api/stories/${storyId}/chapters/${chapterId}/comments/${commentId}/reply`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: replyContent }),
                    credentials: "include",
                }
            );

            const data = await response.json();
            if (!response.ok) {
                setError(data.message || "Something is wrong. Try again!");
                return;
            }

            alert("Reply posted!");
            const addReply = (comments) =>
                comments.map((comment) => {
                    if (comment.id === commentId) {
                        return { ...comment, replies: [...(comment.replies || []), data.reply] };
                    }
                    return { ...comment, replies: addReply(comment.replies || []) };
                });
    
            setComments((prevComments) => addReply(prevComments));

            setForm({ content: "" });
            setReplyingTo(null);

        } catch (err) {
            console.log("error", err);
        }
    }


    async function likeComment(e, commentId) {
        e.preventDefault();
        setError("");
    
        try {
            const response = await fetch(
                `https://fanhub-server.onrender.com/api/stories/${storyId}/chapters/${chapterId}/comments/${commentId}/like/love`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );
    
            const data = await response.json();
            if (!response.ok) {
                setError(data.message || "Something is wrong. Try again!");
                return;
            }
    
            // alert("Liked!");
    
            // Helper function to update likes recursively for comments and replies
        const updateLikes = (commentList) =>
            commentList.map((comment) => {
                if (comment.id === commentId) {
                    if (data.like) {
                        // Unlike: remove this user's like
                        return {
                            ...comment,
                            likes: (comment.likes || []).filter(
                                (like) => like.userId !== data.userId
                            ),
                        };
                    } else if (data.liked) {
                        // Like: add the new like
                        return {
                            ...comment,
                            likes: [...(comment.likes || []), data.liked],
                        };
                    }
                }
                // Recurse into replies
                return {
                    ...comment,
                    replies: updateLikes(comment.replies || []),
                };
            });

        setComments((prevComments) => updateLikes(prevComments));

        alert(data.like ? "Removed like!" : "Liked!");            
    
        } catch (err) {
            console.log("error", err);
            alert("Something went wrong. Please try again.");
        }
    }
    

    async function handleDelete(commentId) {
        console.log("comment", commentId);
        try{
            const message = await Delete(`https://fanhub-server.onrender.com/api/stories/${storyId}/chapters/${chapterId}/comments/${commentId}`);
            alert("delete message", message);
            console.log("mess", message);
            
            const deleteCommentRecursive = (commentList, commentId) => {
                return commentList
                    .filter(comment => comment.id !== commentId) // remove matching comment
                    .map(comment => ({
                        ...comment,
                        replies: deleteCommentRecursive(comment.replies || [], commentId) // go deeper
                    }));
            };
            
            // Example usage in your delete handler:
            setComments(prevComments => deleteCommentRecursive(prevComments, commentId));
            
        } catch(err) {
            console.log("Failed to delete:", err.message);
        } 
    }
    return (
            <div>
            {loading && <p>Loading... please wait</p>}
            {error && <p>{error}</p>}
            {chapter && (
                <div>
                    <header>
                        <h1><b>{chapter.chapter.title}</b></h1>
                    </header>
                    <div>
                        <p>{chapter.chapter.content}</p>
                    </div>
                </div>
            )}

            <ul>
                <li><button onClick={(e) => likeChapter(e, "lovethis")}>❤️ Love this {lovethis.length}</button></li>
                <li><button onClick={(e) => likeChapter(e, "funny")}>😂 Funny {funny.length}</button></li>
                <li><button onClick={(e) => likeChapter(e, "suspenseful")}>😱 Suspenseful {suspenseful.length}</button></li>
                <li><button onClick={(e) => likeChapter(e, "emotional")}>😢 Emotional {emotional.length}</button></li>
                <li><button onClick={(e) => likeChapter(e, "profound")}>🧠 Profound {profound.length}</button></li>
                <li><button onClick={(e) => likeChapter(e, "heartwarming")}>🥰 Heartwarming {heartwarming.length}</button></li>
                <li><button onClick={(e) => likeChapter(e, "shocking")}>🤯 Shocking {shocking.length}</button></li>
                <li><button onClick={(e) => likeChapter(e, "goodwriting")}>✍️ Good Writing {goodwriting.length}</button></li>
                <li><button onClick={(e) => likeChapter(e, "goodcharacters")}>👥 Good Characters {goodcharacters.length}</button></li>
                <li><button onClick={(e) => likeChapter(e, "compellingplot")}>📚 Compelling Plot {compellingplot.length}</button></li>
                <li><button onClick={(e) => likeChapter(e, "strongdialogue")}>🗣️ Strong Dialogue {strongdialogue.length}</button></li>
            </ul>

            <form onSubmit={writeComment}>
                <textarea
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    required
                    placeholder="Comment Here..."
                />
                <button type="submit">Post</button>
            </form>

            
            {comments?.length > 0 && (
                <div>
                    <h4>Comments</h4>
                    {comments.map(comment => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        user={user}
                        chapterUserId={chapter.chapter.userId}
                        replyingTo={replyingTo}
                        setReplyingTo={setReplyingTo}
                        writeReply={writeReply}
                        handleDelete={handleDelete}
                        likeComment={likeComment}
                        form={form}
                        handleChange={handleChange}
                        />

                    ))}
                </div>
            )}
        </div>
    );
}


function CommentItem({
  comment,
  user,
  chapterUserId,
  replyingTo,
  setReplyingTo,
  writeReply,
  handleDelete,
  likeComment,
  form,
  handleChange,
 }) {
    console.log("userrr", user.id);
  return (
    <div key={comment.id} style={{ marginBottom: "1rem", marginLeft: comment.parentId ? "20px" : "0" }}>
      <p>{comment.content}</p>
      <small>{comment.uploadedAt}</small>
      <div>
        <button onClick={(e) => likeComment(e, comment.id)}>
          ❤️ {(comment.likes || []).length} {(comment.likes || []).length === 1 ? "Like" : "Likes"}
        </button>
        {(user.id === comment.userId || user.id === chapterUserId) && (
          <button
            onClick={() => {
              if (window.confirm("Delete this comment?")) {
                handleDelete(comment.id);
              }
            }}
          >
            Delete
          </button>
        )}
        <button onClick={() => setReplyingTo({ id: comment.id, username: comment.user?.username })}>Reply</button>
      </div>

      {/* Reply form */}
      {replyingTo?.id === comment.id && (
        <form onSubmit={(e) => writeReply(e, comment.id)} style={{ marginTop: "0.5rem" }}>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            placeholder="Reply here..."
          />
          <button type="submit">Post</button>
        </form>
      )}

      {/* Recursively render replies */}
      {comment.replies && comment.replies.length > 0 && (
        comment.replies.map(reply => (
            <CommentItem
            key={reply.id}
            comment={reply}
            user={user}
            chapterUserId={chapterUserId}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            writeReply={writeReply}
            handleDelete={handleDelete}
            likeComment={likeComment}
            form={form}
            handleChange={handleChange}
            />
        ))
      )}
    </div>
  );
}


export default Chapter;
import { useCollections } from "../gallery/collectionContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Delete from "../delete/delete";
import { useAuth } from "../auth/authContext";

function HomepageCollections() {
    const { id } = useParams();
    const { user } = useAuth();
    const [collection, setCollection ] = useState(null);
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [likes, setLikes] = useState([]);
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [form, setForm] = useState({ content: "" });
    const [replyingTo, setReplyingTo] = useState({ id: null, username: "" });
  
    useEffect(() => {
        if (collection) {
            setLoading(false);
            setLikes(collection.likes);
            setImages(collection.images);
            setVideos(collection.videos);
        }
    }, [collection]);


    useEffect(() => {
        async function fetchCollection() {
            setError("");
            setLoading(true);
            try {
                const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/collections/collection/${id}`, {
                    method: "GET",
                    credentials: "include",
                });
        
                const data = await response.json();
                console.log("data", data);
                
                if (!response.ok) {
                    setError(data.message);
                    return;
                } 
                setCollection(data.collection);
                console.log("coll", collection);
                
            } catch(err) {
                console.log("error", err);
                alert("Something went wrong. Please try again.");
            } finally{
                setLoading(false);
            }
        };

        fetchCollection();
    }, [id]);

    async function likeCollection(e) {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/collections/${id}/like/love`, {
                method: "POST",
                credentials: "include",
            });
    
            const data = await response.json();
            console.log("data", data);
            if (!response.ok) {
                setError(data.message);
                return;
            } 
            alert("liked!");
            if (data.like) {
                setLikes(prev => prev.filter(like => like.userId !== data.like.userId));
            } else {
                setLikes(prev => [...prev, data]);
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
            const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/collection/${id}/readinglist`, {
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

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prevForm => ({
          ...prevForm,
          [name]: value
        }));
    }    

    async function likeMedia(e, name, id) {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/${name}/${id}/like/love`, {
                method: "POST",
                credentials: "include",
            });
    
            const data = await response.json();
            console.log("datalike", data);
            if (!response.ok) {
                setError(data.message || "Something is wrong. Try again!");
                return;
            } 
            alert("liked!");

            // if (name === "images") {
            //     setImages(prev =>
            //         prev.map(img =>
            //             img.id === id 
            //                 ? { ...img, likes: [...(img.likes || []), data.liked] }
            //                 : img
            //         )
            //     );
            //     console.log("imag", images);
            // } else if (name === "videos") {
            //     setVideos(prev =>
            //         prev.map(vid =>
            //             vid.id === id
            //                 ? { ...vid, likes: [...(vid.likes || []), data.liked] }
            //                 : vid
            //         )
            //     );
            // }
             

            if (name === "images") {
                setImages(prev =>
                    prev.map(img => {
                        if (img.id !== id) return img;
            
                        let newLikes = img.likes || [];
            
                        if (data.like) {
                            // Remove the unlike
                            newLikes = newLikes.filter(
                                like => !(like.userId === data.userId && like.like === data.like)
                            );
                        } else if (data.liked) {
                            // Add the like
                            newLikes = [...newLikes, data.liked];
                        }
            
                        return { ...img, likes: newLikes };
                    })
                );
            } else if (name === "videos") {
                setVideos(prev =>
                    prev.map(vid => {
                        if (vid.id !== id) return vid;
            
                        let newLikes = vid.likes || [];
            
                        if (data.like) {
                            newLikes = newLikes.filter(
                                like => !(like.userId === data.userId && like.like === data.like)
                            );
                        } else if (data.liked) {
                            newLikes = [...newLikes, data.liked];
                        }
            
                        return { ...vid, likes: newLikes };
                    })
                );
            }

        } catch(err) {
            console.log("error", err);
            alert("Something went wrong. Please try again.");
        }
    };

    async function writeComment(e, id, name) {
        e.preventDefault();
        setLoading(true);
        setError("");
        console.log("idd", id);
        try {
            const replyContent = `@${user.username} ${form.content}`;
            const response = await fetch(
                `https://fanhub-server.onrender.com/api/gallery/${name}/${id}/post-comment`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: replyContent }),
                    credentials: "include",
                }
            );
    
            const data = await response.json();
            console.log("comment data", data);
            if (!response.ok) {
                setError(data.message || "Something is wrong. Try again!");
                return;
            }
    
            alert("comment posted!");
    
            if (name === "images") {
                setImages(prev =>
                    prev.map(img =>
                        img.id === id 
                            ? { ...img, comments: [...(img.comments || []), data.comment] }
                            : img
                    )
                );
                console.log("imag", images);
            } else if (name === "videos") {
                setVideos(prev =>
                    prev.map(vid =>
                        vid.id === id
                            ? { ...vid, comments: [...(vid.comments || []), data.comment] }
                            : vid
                    )
                );
            }
    
            setForm({ content: "" });
    
        } catch (err) {
            console.error("error", err);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }    

    async function writeReply(e, commentId, name, id) {
        e.preventDefault();
        setError("");

        try {
            const replyContent = `@${user.username} ${form.content}`;
            const response = await fetch(
                `https://fanhub-server.onrender.com/api/gallery/${name}/${id}/comments/${commentId}/reply`,
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

            if (name === "images") {
                setImages((prev) =>
                    prev.map((img) =>
                        img.id === id ? { ...img, comments: addReply(img.comments || []) } : img
                    )
                );
                } else if (name === "videos") {
                setVideos((prev) =>
                    prev.map((vid) =>
                        vid.id === id ? { ...vid, comments: addReply(vid.comments || []) } : vid
                    )
                );
            }
              

            setForm({ content: "" });
            setReplyingTo(null);

        } catch (err) {
            console.log("error", err);
        }
    }


    async function likeComment(e, commentId, name, id) {
        e.preventDefault();
        setError("");
    
        try {
            const response = await fetch(
                `https://fanhub-server.onrender.com/api/gallery/${name}/${id}/comments/${commentId}/like/love`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );
    
            const data = await response.json();
            console.log('likk', data);
            if (!response.ok) {
                setError(data.message || "Something is wrong. Try again!");
                return;
            }
    
            alert("Liked!");
    
            // Helper function to update likes for a comment or reply
            // const updateLikes = (commentList) =>
            //     commentList.map((comment) =>
            //         comment.id === commentId
            //         ? { ...comment, likes: [...(comment.likes || []), data.liked] } // ✅ safe
            //         : { ...comment, replies: updateLikes(comment.replies || []) }
            // );
                
            // if (name === "images") {
            //     setImages((prev) =>
            //         prev.map((img) =>
            //             img.id === id ? { ...img, comments: updateLikes(img.comments || []) } : img
            //         )
            //     );
            //     } else if (name === "videos") {
            //     setVideos((prev) =>
            //         prev.map((vid) =>
            //             vid.id === id ? { ...vid, comments: updateLikes(vid.comments || []) } : vid
            //         )
            //     );
            // }

            const updateLikes = (commentList) =>
                commentList.map(comment => {
                    if (comment.id === commentId) {
                        let newLikes = comment.likes || [];
            
                        if (data.like) {
                            // Unlike: remove from likes
                            newLikes = newLikes.filter(
                                like => !(like.userId === data.userId && like.like === data.like)
                            );
                        } else if (data.liked) {
                            // Like: add to likes
                            newLikes = [...newLikes, data.liked];
                        }
            
                        return { ...comment, likes: newLikes };
                    } else {
                        // Recurse into replies
                        return { ...comment, replies: updateLikes(comment.replies || []) };
                    }
            });
            
            if (name === "images") {
                setImages(prev =>
                    prev.map(img =>
                        img.id === id
                            ? { ...img, comments: updateLikes(img.comments || []) }
                            : img
                    )
                );
            } else if (name === "videos") {
                setVideos(prev =>
                    prev.map(vid =>
                        vid.id === id
                            ? { ...vid, comments: updateLikes(vid.comments || []) }
                            : vid
                    )
                );
            }            
                              
    
        } catch (err) {
            console.log("error", err);
            alert("Something went wrong. Please try again.");
        }
    }

    async function handleDelete(commentId, name, id) {
        console.log("comment", commentId);
        try{
            const message = await Delete(`https://fanhub-server.onrender.com/api/gallery/${name}/${id}/comments/${commentId}`);
            alert("delete message", message);
            console.log("mess", message);
            
            const deleteCommentRecursive = (commentList, commentId) => {
                return commentList
                  .filter(comment => comment.id !== commentId)
                  .map(comment => ({
                    ...comment,
                    replies: deleteCommentRecursive(comment.replies || [], commentId)
                  }));
              };
              
              if (name === "images") {
                setImages((prev) =>
                  prev.map((img) =>
                    img.id === id ? { ...img, comments: deleteCommentRecursive(img.comments || [], commentId) } : img
                  )
                );
              } else if (name === "videos") {
                setVideos((prev) =>
                  prev.map((vid) =>
                    vid.id === id ? { ...vid, comments: deleteCommentRecursive(vid.comments || [], commentId) } : vid
                  )
                );
            }
              
            
        } catch(err) {
            console.log("Failed to delete:", err.message);
        } 
    }

    return (
        <div>       
            {collection ? (
                <header>
                    <li><img style={{ width: "200px" }} src={collection.img} /></li>
                    <li>{collection.name}</li>
                    <li>{collection.user.username}</li>
                    <li>{collection.tags}</li>
                    <li>{collection.status}</li>
                    <li>
                        <button onClick={likeCollection}>
                            ❤️ {likes.length} {likes.length === 1 ? "Like" : "Likes"}
                        </button>
                    </li>
                    <li onClick={()=> addToLibrary(collection.id)}>Add to Library</li>
                    <li onClick={() => navigate(`/collections/${id}/reviews`)}>
                        {collection.review.length || 0} {collection.review.length === 1 ? "Review" : "Reviews"}
                    </li>
                    <li>
                        <button onClick={() => navigate(`/collections/${collection.id}/review`)}>
                            ❤️ write a review 
                        </button>
                    </li>
                    <li><b>Description:</b> {collection.description}</li>
                </header>
            ):(
                <div>
                    {loading && <p>Loading...please wait</p>}
                    {error && <p>{error}</p>} 
                </div>
            )}
            

            <main>
                {images.map(image => (
                    <div key={image.id}>
                        <div>
                            <li>{image.uploadedAt}</li>
                            <li>
                                <img
                                src={image.url}
                                alt={image.caption}
                                style={{ width: "200px" }}
                                />
                            </li>
                            <li>{image.caption}</li>
                            <li><button onClick={(e) => likeMedia(e, "images", image.id)}>❤️ Love {image?.likes.length}</button></li>
                        </div>
                        <div>
                            <form onSubmit={(e) => writeComment(e, image.id, "images")}>
                                <textarea
                                    name="content"
                                    value={form.content}
                                    onChange={handleChange}
                                    required
                                    placeholder="Comment Here..."
                                />
                                <button type="submit">Post</button>
                            </form>

                            {image.comments?.length > 0 && (
                                <div>
                                    <h4>Comments</h4>
                                    {image.comments.map(comment => (
                                        <CommentItem
                                            key={comment.id}
                                            comment={comment}
                                            user={user}
                                            userId={image.userId}
                                            name="images"
                                            id={image.id}
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
                    </div> 
                ))}

                {videos.map(video => (
                    <div key={video.id}>
                        <div>
                            <li>{video.uploadedAt}</li>
                            <li>
                                <video
                                src={video.url}
                                controls
                                style={{ width: "200px" }}
                                />
                            </li>
                            <li>{video.caption}</li>
                            <li><button onClick={(e) => likeMedia(e, "videos", video.id)}>❤️ Love {video.likes.length}</button></li>
                        </div>
                        <div>
                            <form onSubmit={(e) => writeComment(e, video.id, "videos")}>
                                <textarea
                                    name="content"
                                    value={form.content}
                                    onChange={handleChange}
                                    required
                                    placeholder="Comment Here..."
                                />
                                <button type="submit">Post</button>
                            </form>

                            {video.comments?.length > 0 && (
                                <div>
                                    <h4>Comments</h4>
                                    {video.comments.map(comment => (
                                        <CommentItem
                                            key={comment.id}
                                            comment={comment}
                                            user={user}
                                            userId={video.userId}
                                            name="videos"
                                            id={video.id}
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
                    </div>
                ))}
                 
            </main>
        </div>
    );
}


function CommentItem({
    comment,
    user,
    userId,
    name,
    id,
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
          <button onClick={(e) => likeComment(e, comment.id, name, id)}>
            ❤️ {(comment.likes || []).length} {(comment.likes || []).length === 1 ? "Like" : "Likes"}
          </button>
          {(user.id === comment.userId || user.id === userId) && (
            <button
              onClick={() => {
                if (window.confirm("Delete this comment?")) {
                  handleDelete(comment.id, name, id);
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
          <form onSubmit={(e) => writeReply(e, comment.id, name, id)} style={{ marginTop: "0.5rem" }}>
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
              userId={userId}
              name={name}
              id={id}
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

export default HomepageCollections;
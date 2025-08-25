import { useState, useEffect } from "react";
import Delete from "../delete/delete";
import { useAuth } from "../auth/authContext";

function Gallery() {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const { user } = useAuth();
    const [form, setForm] = useState({ content: "" });
    const [replyingTo, setReplyingTo] = useState({ id: null, username: "" });

    useEffect(() => {
        async function fetchMedias() {
            setError("");
            setLoading(true);
            try {
                const imageUrl = 'https://fanhub-server.onrender.com/api/gallery/images';
                const videoUrl = 'https://fanhub-server.onrender.com/api/gallery/videos';
               
                const [imagesResponse, videosResponse] = await Promise.all([
                  fetch(imageUrl, { method: 'GET', credentials: 'include' }),
                  fetch(videoUrl, { method: 'GET', credentials: 'include' })
                ]);
                
                const [dataimages, datavideos] = await Promise.all([
                  imagesResponse.json(),
                  videosResponse.json()
                ]);
        
                console.log("image", dataimages, "video", datavideos);      
                
                if (!imagesResponse.ok || !videosResponse.ok) {
                    setError(dataimages.message || datavideos.message || "Something went wrong");
                    return;
                } 
                
                setImages(dataimages.images);
                setVideos(datavideos.videos);
                
            } catch(err) {
                console.log("error", err);
                alert("Something went wrong. Please try again.");
            } finally{
                setLoading(false);
            }
        };

        fetchMedias();
    }, []);
    

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

            if (name === "images") {
                setImages(prev =>
                    prev.map(img =>
                        img.image.id === id 
                            ? { ...img, likes: [...(img.likes || []), data.liked] }
                            : img
                    )
                );
                console.log("imag", images);
            } else if (name === "videos") {
                setVideos(prev =>
                    prev.map(vid =>
                        vid.video.id === id
                            ? { ...vid, likes: [...(vid.likes || []), data.liked] }
                            : vid
                    )
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
                        img.image.id === id 
                            ? { ...img, comments: [...(img.comments || []), data.comment] }
                            : img
                    )
                );
                console.log("imag", images);
            } else if (name === "videos") {
                setVideos(prev =>
                    prev.map(vid =>
                        vid.video.id === id
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
                        img.image.id === id ? { ...img, comments: addReply(img.comments || []) } : img
                    )
                );
                } else if (name === "videos") {
                setVideos((prev) =>
                    prev.map((vid) =>
                        vid.video.id === id ? { ...vid, comments: addReply(vid.comments || []) } : vid
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
            const updateLikes = (commentList) =>
                commentList.map((comment) =>
                    comment.id === commentId
                    ? { ...comment, likes: [...(comment.likes || []), data.liked] } // ✅ safe
                    : { ...comment, replies: updateLikes(comment.replies || []) }
            );
                
            if (name === "images") {
                setImages((prev) =>
                    prev.map((img) =>
                        img.image.id === id ? { ...img, comments: updateLikes(img.comments || []) } : img
                    )
                );
                } else if (name === "videos") {
                setVideos((prev) =>
                    prev.map((vid) =>
                        vid.video.id === id ? { ...vid, comments: updateLikes(vid.comments || []) } : vid
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
                    img.image.id === id ? { ...img, comments: deleteCommentRecursive(img.comments || [], commentId) } : img
                    )
                );
                } else if (name === "videos") {
                setVideos((prev) =>
                    prev.map((vid) =>
                    vid.video.id === id ? { ...vid, comments: deleteCommentRecursive(vid.comments || [], commentId) } : vid
                    )
                );
            }
                
            
        } catch(err) {
            console.log("Failed to delete:", err.message);
        } 
    }
    
    return (
        <div>
            {loading && <p>loading.. please wait</p>}
            {error && <p>{error}</p>}

            { images?.length > 0 && (
                images.map(image => (
                    (image.image.collectionId === null) && (
                        <div key={image.image.id}>
                            <div>
                                <li>{image?.image.uploadedAt}</li>
                                <li>
                                    <img src={image.image.url}
                                        style={{ width: "200px"}}
                                    />
                                </li>
                                <li>{image.image.caption}</li>
                                <li>{image.likes.length} likes {image.comments.length} comments {image.image.views.length} views</li>
                                <li><button onClick={(e) => likeMedia(e, "images", image.image.id)}>❤️ Love {image?.likes.length}</button></li>
                            </div>
                            
                            <div>
                                <form onSubmit={(e) => writeComment(e, image.image.id, "images")}>
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
                                                userId={image.image.userId}
                                                name="images"
                                                id={image.image.id}
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
                    )
                )))
            }

            { videos?.length > 0 && (
                videos.map(video => (
                    (video.video.collectionId === null) && (
                        <div key={video.video.id}>
                            <div>
                                <li>{video.video.uploadedAt}</li>
                                <li>
                                    <video 
                                        src={video.video.url} 
                                        controls 
                                        style={{ width: "200px" }} 
                                    />
                                </li>
                                <li>{video.video.caption}</li>
                                <li>{video.likes.length} likes {video.comments.length} comments {video.video.views.length} views</li>
                                <li><button onClick={(e) => likeMedia(e, "videos", video.video.id)}>❤️ Love {video.likes.length}</button></li>
                            </div>
                            <div>
                                <form onSubmit={(e) => writeComment(e, video.video.id, "videos")}>
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
                                                userId={video.video.userId}
                                                name="videos"
                                                id={video.video.id}
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
                    ) 
                )))
            }
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


export default Gallery;
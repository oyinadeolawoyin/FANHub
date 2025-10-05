import { useState, useEffect } from "react";
import { useAuth } from "../auth/authContext";
import Delete from "../delete/delete";
import { useParams } from "react-router-dom";
import CreatePost from "../post/createPost";

function ProfilePosts() {
    const { id } = useParams();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState([])
    const { user } = useAuth();
    const [form, setForm] = useState({ content: "" });
    const [replyingTo, setReplyingTo] = useState({ id: null, username: "" });
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    
    useEffect(() => {
        async function fetchPosts() {
            setError("");
            setLoading(true);
            try {
                const response = await fetch(`https://fanhub-server.onrender.com/api/posts/${id}`, {
                    method: "GET",
                    credentials: "include",
                });
        
                const data = await response.json();
                console.log("data", data);
                
                if (!response.ok) {
                    setError(data.message);
                    return;
                } 
                setPosts(data.posts);
                console.log("posts", posts);
                
            } catch(err) {
                console.log("error", err);
                alert("Something went wrong. Please try again.");
            } finally{
                setLoading(false);
            }
        };

        fetchPosts();
    }, [id]);

    function handleSearch(e) {
        e.preventDefault();
       
        if (posts) {
            console.log("posts",posts);
            const results = posts.filter(p => p.post.title.toLowerCase() === search.toLowerCase());
            setSearchResults(results);      
        }
    }

    useEffect(() => {
        if (search.trim() === "") {
          setSearchResults([]);
        }
    }, [search]);
      

    function handlePostCreated(newPost) {
        setPosts((prev) => [newPost, ...prev]); // add new post to the top
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prevForm => ({
            ...prevForm,
            [name]: value
        }));
    }    

    async function likePost(e, id) {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/posts/${id}/like/love`, {
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

            setPosts(prev =>
                prev.map(post => {
                    if (post.post.id === id) {
                        let newLikes = post.likes || [];
            
                        if (data.like) {
                            // ✅ Unlike: remove the like
                            newLikes = newLikes.filter(
                                like => !(like.userId === data.userId && like.like === data.like)
                            );
                        } else if (data.liked) {
                            // ✅ Like: add the new like
                            newLikes = [...newLikes, data.liked];
                        }
            
                        return { ...post, likes: newLikes };
                    }
                    return post;
                })
            );
            
            console.log("post", posts);
        
                
        } catch(err) {
            console.log("error", err);
            alert("Something went wrong. Please try again.");
        }
    };

    async function writeComment(e, id) {
        e.preventDefault();
        setLoading(true);
        setError("");
        console.log("idd", id);
        try {
            const replyContent = `@${user.username} ${form.content}`;
            const response = await fetch(
                `https://fanhub-server.onrender.com/api/posts/${id}/comment`,
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
    
            setPosts(prev =>
                prev.map(post =>
                    post.post.id === id 
                        ? { ...post, comments: [...(post.comments || []), data.comment] }
                        : post
                )
            );
            console.log("post", posts);
          
    
            setForm({ content: "" });
    
        } catch (err) {
            console.error("error", err);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }    

    async function writeReply(e, commentId,id) {
        e.preventDefault();
        setError("");

        try {
            const replyContent = `@${user.username} ${form.content}`;
            const response = await fetch(
                `https://fanhub-server.onrender.com/api/posts/${id}/comments/${commentId}/reply`,
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

            setPosts((prev) =>
                prev.map((post) =>
                    post.post.id === id ? { ...post, comments: addReply(post.comments || []) } : post
                )
            );   

            setForm({ content: "" });
            setReplyingTo(null);

        } catch (err) {
            console.log("error", err);
        }
    }

    
    async function likeComment(e, commentId, id) {
        e.preventDefault();
        setError("");
    
        try {
            const response = await fetch(
                `https://fanhub-server.onrender.com/api/posts/${id}/comments/${commentId}/like/love`,
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

            const updateLikes = (commentList) =>
                commentList.map((comment) => {
                    if (comment.id === commentId) {
                        let newLikes = comment.likes || [];
            
                        if (data.like) {
                            // ✅ Unlike: remove
                            newLikes = newLikes.filter(
                                like => !(like.userId === data.userId && like.like === data.like)
                            );
                        } else if (data.liked) {
                            // ✅ Like: add
                            newLikes = [...newLikes, data.liked];
                        }
            
                        return { ...comment, likes: newLikes };
                    } else {
                        // ✅ Recurse into replies
                        return { ...comment, replies: updateLikes(comment.replies || []) };
                    }
                });
            
            setPosts((prev) =>
                prev.map((post) =>
                    post.post.id === id
                        ? { ...post, comments: updateLikes(post.comments || []) }
                        : post
                )
            );            
             
                            
    
        } catch (err) {
            console.log("error", err);
            alert("Something went wrong. Please try again.");
        }
    }
    
    async function handleDelete(commentId, id) {
        console.log("comment", commentId);
        try{
            const message = await Delete(`https://fanhub-server.onrender.com/api/posts/${id}/comments/${commentId}`);
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
                
            setPosts((prev) =>
                prev.map((post) =>
                    post.post.id === id ? { ...post, comments: deleteCommentRecursive(post.comments || [], commentId) } : post
                )
            );   
            
        } catch(err) {
            console.log("Failed to delete:", err.message);
        } 
    }
            
    
    return (
        <div>
            {loading && <p>loading.. please wait</p>}
            {error && <p>{error}</p>}
            <form onSubmit={(e) => handleSearch(e, "story")}>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search posts by title..."
                />
                <button type="submit">Search Stories</button>
            </form>
            <div>
                <CreatePost onPostCreated={handlePostCreated} />
            </div>
            <PostList
                posts={searchResults.length > 0 ? searchResults : posts}
                user={user}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                form={form}
                handleChange={handleChange}
                writeComment={writeComment}
                writeReply={writeReply}
                handleDelete={handleDelete}
                likeComment={likeComment}
                likePost={likePost}
            />
        </div>
    );
}

function PostList({ posts, user, replyingTo, setReplyingTo, form, handleChange, writeComment, writeReply, handleDelete, likeComment, likePost }) {
    return (
      <div> 
        {posts.length > 0 && posts.map(post => (
          <div key={post.post.id}>
            <div>
              <li>{post.post.title}</li>
              {post.post.img !== null && (
                <li>
                  <img style={{ width: "200px" }} src={post.post?.img} />
                </li>
              )}
              <li>{post.post.content}</li>
              <li>
                {post.post.uploadedAt} {post.likes.length} likes {post.comments.length} comments
              </li>
              <li>
                <button onClick={(e) => likePost(e, post.post.id)}>
                  ❤️ Love {post.likes.length}
                </button>
              </li>
            </div>
  
            <div>
              <form onSubmit={(e) => writeComment(e, post.post.id)}>
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  required
                  placeholder="Comment Here..."
                />
                <button type="submit">Post</button>
              </form>
  
              {post.comments?.length > 0 && (
                <div>
                  <h4>Comments</h4>
                  {post.comments.map(comment => (
                    <CommentItem
                      comment={comment}
                      user={user}
                      userId={post.post.userId}
                      id={post.post.id}
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
      </div>
    );
}
  

function CommentItem({
    comment,
    user,
    userId,
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
          <button onClick={(e) => likeComment(e, comment.id, id)}>
            ❤️ {(comment.likes || []).length} {(comment.likes || []).length === 1 ? "Like" : "Likes"}
          </button>
          {(user.id === comment.userId || user.id === userId) && (
            <button
              onClick={() => {
                if (window.confirm("Delete this comment?")) {
                  handleDelete(comment.id, id);
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
          <form onSubmit={(e) => writeReply(e, comment.id, id)} style={{ marginTop: "0.5rem" }}>
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

export default ProfilePosts;
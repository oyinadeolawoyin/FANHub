import { useState, useEffect } from "react";
import { useAuth } from "../auth/authContext";
import { useParams, useNavigate } from "react-router-dom";
import CreatePost from "../post/createPost";
import CommentList from "../comment/commentList";
import Delete from "../delete/delete";

function ProfilePosts() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();
  
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [likeLoadingId, setLikeLoadingId] = useState(null);
  const [reloadPosts, setReloadPosts] = useState(false);
  const [visibleComments, setVisibleComments] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  
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
              
              if (response.status === 500) {
                  navigate("/error", { state: { message: data.message || "Process failed" } });
                  return;
              } else {
                  if (!response.ok && response.status !== 500) {
                      setError(data.message); 
                      return;
                  }
              } 
              console.log("posts", data.posts);
              setPosts(data.posts);
              
          }  catch(err) {
              navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
          } finally {
              setLoading(false);
          }
      };

      fetchPosts();
  }, [id, reloadPosts]);

  function handleSearch(e) {
      e.preventDefault();
      
      if (posts) {
          const results = posts.filter(p => post.title.toLowerCase() === search.toLowerCase());
          setSearchResults(results);      
      }
  }

  useEffect(() => {
      if (search.trim() === "") {
        setSearchResults([]);
      }
  }, [search]);
    

  function handlePostCreated() {
    setReloadPosts(prev => !prev);
  }

  async function likePost(e, id) {
    e.preventDefault();
    setError("");
    setLikeLoadingId(id);
  
    try {
      const response = await fetch(`https://fanhub-server.onrender.com/api/posts/${id}/like/love`, {
        method: "POST",
        credentials: "include",
      });
  
      const data = await response.json();
  
      if (response.status === 500) {
        navigate("/error", { state: { message: data.message || "Process failed" } });
        return;
      } else if (!response.ok) {
        setError(data.message || "Something went wrong");
        return;
      }
  
      // Determine if this is a like or unlike
      const liked = data.message === "Liked!";
      const likeData = liked ? 1 : -1;
  
      // Update the local state
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id !== id) return post;
  
          return {
            ...post,
            _count: {
              ...post._count,
              likes: (post._count?.likes || 0) + likeData,
            },
            likedByCurrentUser: liked,
          };
        })
      );
  
      // Add like points for user only when liked
      if (liked) {
        const socialResponse = await fetch(
          `https://fanhub-server.onrender.com/api/users/${user.id}/social/likepoint`,
          {
            method: "POST",
            credentials: "include",
          }
        );
  
        if (!socialResponse.ok) {
          const errData = await socialResponse.json();
          setError(errData.message || "Failed to update like points");
        }
      }
  
    } catch (err) {
      navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
    } finally {
      setLikeLoadingId(null);
    }
  }

  // Toggle show/hide comments
  function toggleComments(tweetId) {
    setVisibleComments((prev) => ({
      ...prev,
      [tweetId]: !prev[tweetId],
    }));
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try{
        await Delete(`https://fanhub-server.onrender.com/api/posts/${id}`);
        setPosts(prev => prev.filter(s => Number(s.id) !== Number(id)));
    } catch(err) {
        navigate("/error", { state: { message:  err.message } });
    } finally {
        setDeletingId(null);
    }
  }

             
  return (
      <div>
      {loading ? (
        <p>loading.... please wait!</p>
      ) : (
        <div>
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
            likePost={likePost}
            likeLoadingId={likeLoadingId}
            toggleComments={toggleComments}         
            visibleComments={visibleComments} 
            deletingId={deletingId}
            handleDelete={handleDelete} 
            user={user}  
          />
        </div>
      )}
      {error && <p>{error}</p>}
    </div>
  );
}

function PostList({
  posts,
  likePost,
  likeLoadingId,
  toggleComments,           
  visibleComments,
  deletingId,
  handleDelete,
  user
}) {
  return (
    <div>
      {posts.length > 0 &&
        posts.map((post) => (
          <div key={post.id} style={{ marginBottom: "2rem", borderBottom: "1px solid #ddd" }}>
            <div>
              <li>{post.title}</li>
              {post.img !== null && (
                <li>
                  <img style={{ width: "200px" }} src={post?.img} />
                </li>
              )}
              <li>{post.content}</li>
              <li>
                <button onClick={() => toggleComments(post.id)}>
                  {visibleComments[post.id]
                    ? `Hide Comments (${post._count.comments})`
                    : `Show Comments (${post._count.comments})`}
                </button>
              </li>
              <li>
                <button
                  onClick={(e) => likePost(e, post.id)}
                  disabled={likeLoadingId === post.id}
                >
                  {post.likedByCurrentUser ? "💔 Unlike" : "❤️ Like"} {post._count?.likes || 0}
                </button>
              </li>
            </div>

            {user.id ===post.userId && (
            <div>
                <button type="submit"  disabled={deletingId === post.id}
                  onClick={() => {
                    const confirmed = window.confirm("Are you sure you want to delete this story?");
                    if (confirmed) {
                    handleDelete(post.id);
                    }
                  }}
                >
                  {deletingId === post.id ? "Loading..." : "Delete" }
                </button>
            </div>
          )}

            {visibleComments[post.id] && (
              <section className="comments-section">
                <h3>Comments</h3>
                <CommentList postId={post.id} contentOwnerId={post.userId} />
              </section>
            )}
          </div>
        ))}
    </div>
  );
}


export default ProfilePosts;
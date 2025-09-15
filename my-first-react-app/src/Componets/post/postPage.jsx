import Delete from "../delete/delete";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function Posts() {
    const { id } = useParams();
    const [posts, setPosts] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchPost() {
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
                console.log("posts", data.posts);
                
            } catch(err) {
                console.log("error", err);
                alert("Something went wrong. Please try again.");
            } finally{
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    async function handleDelete(id) {
            try{
                const message = await Delete(`https://fanhub-server.onrender.com/api/posts/${id}`);
                alert(message);
                setImages(prev => prev.filter(s => s.id !== id))
            } catch(err) {
                console.log("Failed to delete:", err.message);
            } 
    }
    
    return (
        <div>
            {loading && <p>loading.. please wait</p>}
            {error && <p>{error}</p>}

            {posts &&(
                posts.length > 0 ? (
                    posts.map(post => (
                        <div key={post.post.id}>
                            <li>{post.post.title}</li>
                            <li><img style={{ width: "200px" }} src={post.post?.img} /></li>
                            <li>{post.post.content}</li>
                            <li>{post.post.uploadedAt} likes: {post.likes.length} comments: {post.comments.length}</li>
                            <button
                                onClick={() => {
                                const confirmed = window.confirm("Are you sure you want to delete this image?");
                                if (confirmed) {
                                    handleDelete(post.post.id);
                                }
                                }}
                            >
                                Delete
                            </button>
                        </div>
                ))): (<p>No posts yet!</p>)
            )}
        </div>
    );
}

export default Posts;
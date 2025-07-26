import { usePosts } from "./postContext";
import Delete from "../delete/delete";

function Posts() {
    const { posts, error, loading } = usePosts();
    console.log("posts", posts);

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

            { posts.length > 0 ? (
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
                ))): (<p>No posts yet!</p>)}
        </div>
    );
}

export default Posts;
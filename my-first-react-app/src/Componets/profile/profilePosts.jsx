import { usePosts } from "../post/postContext";

function ProfilePosts() {
    const { posts, error, loading } = usePosts();
    console.log("posts", posts);
    
    return (
        <div>
            {loading && <p>loading.. please wait</p>}
            {error && <p>{error}</p>}

            { posts.length > 0 && (
                posts.map(post => (
                    <div key={post.post.id}>
                        <p>
                            <li>{post.post.title}</li>
                            <li><img style={{ width: "200px" }} src={post.post?.img} /></li>
                            <li>{post.post.content}</li>
                            <li>{post.post.uploadedAt} {post.likes.length} likes {post.comments.length} comments</li>
                        </p>
                    </div>
                )))
            }
        </div>
    );
}

export default ProfilePosts;
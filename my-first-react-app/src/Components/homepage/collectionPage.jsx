import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import CommentList from "../comment/commentList";

function HomepageCollections() {
    const { id } = useParams();
    const { user } = useAuth();
    const [collection, setCollection ] = useState(null);
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
 
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);

    const [libraryLoading, setLibraryLoading] = useState(false);
    const [libraryStatus, setLibraryStatus] = useState({}); 
    const [likeLoading, setLikeLoading] = useState(false);
    const [likeLoadingId, setLikeLoadingId] = useState(null);
    const [visibleComments, setVisibleComments] = useState({});

    useEffect(() => {
        if (collection) {
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
                console.log("collection", data);
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
                    [data.collection.id]: data.collection.library?.length > 0,
                }));

                setCollection(data.collection);
                setImages(data.collection.images)
                setVideos(data.collection.videos);
                
            } catch(err) {
                navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
            } finally {
                setLoading(false);
            }
        };

        fetchCollection();
    }, [id]);

    async function likeCollection(e) {
        e.preventDefault();
        setError("");
        setLikeLoading(true);

        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/collections/${id}/like/love`, {
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

            alert("liked!");
            
            // Update story state locally
            setCollection(prev => {
                const likesData = data.message === "Liked!" ? 1 : -1;
                const userLiked = data.message === "Liked!";
        
                return {
                ...prev,
                _count: {
                    ...prev._count,
                    likes: prev._count.likes + likesData,
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
            navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
            setLikeLoading(false);
        }
    };

    async function addToLibrary(id) {
        setError("")
        setLibraryLoading(true);

        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/collection/${id}/readinglist`, {
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
            navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
            setLibraryLoading(false);
        }
    }   

    async function likeMedia(e, name, id) {
        e.preventDefault();
        setError("");
        setLikeLoadingId(id);
    
        try {
            const response = await fetch(
                `https://fanhub-server.onrender.com/api/gallery/${name}/${id}/like/love`,
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
            } else if (!response.ok) {
                setError(data.message || "Failed to like/unlike");
                return;
            }
    
            const liked = data.message === "Liked!";
            const likeData = liked ? 1 : -1;
    
            //Update image or video state based on media type
            const updateMedia = (prevItems) =>
                prevItems.map((item) => {
                    if (item.id !== id) return item;
    
                    return {
                        ...item,
                        _count: {
                            ...item._count,
                            likes: item._count.likes + likeData,
                        },
                        likedByCurrentUser: liked,
                    };
                });
    
            if (name === "images") {
                setImages(updateMedia);
            } else if (name === "videos") {
                setVideos(updateMedia);
            }
    
            //Give points only when the user liked
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
            navigate("/error", {
                state: {
                    message:
                        "Network error: Please check your internet connection.",
                },
            });
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

    return (
        <div>   
            {error && <p>{error}</p>}    
            {!collection || loading ? (
                <p>Loading... please wait!</p>
                ):(
                    <div>
                        <header>
                            <li><img style={{ width: "200px" }} src={collection.img} /></li>
                            <li onClick={() => navigate(`/profile/${collection.user.username}/${collection.userId}/about`)}>{collection.name}</li>
                            <li>{collection.user.username}</li>
                            <li>{collection.primarygenre} / {collection.secondarygenre}</li>
                            <li>Subgenres: {collection.primarysubgenre.join(" , ")} / {collection.secondarysubgenre.join(" , ")}</li>
                            <li>{collection.audience}</li>
                            <li>{collection.age}</li>
                            <li>{collection.status}</li>
                            <li>{collection._count.views} views</li>
                            <li>
                                <button onClick={likeCollection} disabled={likeLoading}>
                                    {collection.likedByCurrentUser ? "❤️ Liked" : "🤍 Like"} {collection._count.likes}
                                </button>
                            </li>
                    
                            <li>
                                <button
                                    disabled={libraryLoading === collection.id}
                                    onClick={() => addToLibrary(collection.id)}
                                >
                                {libraryLoading === collection.id
                                    ? "Loading..."
                                    : libraryStatus[collection.id]
                                    ? "❌ Remove from Library"
                                    : "📚 Add to Library"}
                                </button>
                            </li>
                            
                            <li onClick={() => navigate(`/collections/${id}/reviews`)}>
                                {collection._count.review || 0} {collection._count.review === 1 ? "Review" : "Reviews"}
                            </li>
                            <li>
                                <button onClick={() => navigate(`/collections/${collection.id}/review`)}>
                                    ❤️ write a review 
                                </button>
                            </li>
                            <li><b>Description:</b> {collection.description}</li>
                        </header>
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
                                <li>{image._count.comments} comments</li>
                                <button
                                    onClick={(e) => likeMedia(e, "images", image.id)}
                                    disabled={likeLoadingId === image.id}
                                >
                                    {image.likedByCurrentUser ? "💔 Unlike" : "❤️ Like"} {image._count?.likes || 0}
                                </button>
                            </div>
                            {visibleComments[image.id] && (
                                <section className="comments-section">
                                    <h3>Comments</h3>
                                    <CommentList imageId={image.id} contentOwnerId={image.userId} />
                                </section>
                            )}
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
                                <li>{video._count.comments} comments</li>
                                <button
                                    onClick={(e) => likeMedia(e, "videos", video.id)}
                                    disabled={likeLoadingId === video.id}
                                >
                                    {video.likedByCurrentUser ? "💔 Unlike" : "❤️ Like"} {video._count?.likes || 0}
                                </button>
                            </div>
                            {visibleComments[video.id] && (
                                <section className="comments-section">
                                    <h3>Comments</h3>
                                    <CommentList videoId={video.id} contentOwnerId={video.userId} />
                                </section>
                            )}
                        </div>
                    ))}
                 
                </main>
            </div>
    );
}

export default HomepageCollections;
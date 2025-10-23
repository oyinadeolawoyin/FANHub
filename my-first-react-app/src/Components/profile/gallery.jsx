import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import CommentList from "../comment/commentList";

function Gallery() {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    
    const [search, setSearch] = useState("");
    const [imageSearchResults, setImageSearchResults] = useState([]);
    const [videoSearchResults, setVideoSearchResults] = useState([]);
    const [likeLoadingId, setLikeLoadingId] = useState(null);
    const [visibleComments, setVisibleComments] = useState({});
    

    useEffect(() => {
        async function fetchMedias() {
            setError("");
            setLoading(true);
            try {
                const imageUrl = `https://fanhub-server.onrender.com/api/gallery/images/${id}`;
                const videoUrl = `https://fanhub-server.onrender.com/api/gallery/videos/${id}`;
               
                const [imagesResponse, videosResponse] = await Promise.all([
                  fetch(imageUrl, { method: 'GET', credentials: 'include' }),
                  fetch(videoUrl, { method: 'GET', credentials: 'include' })
                ]);
                
                const [dataimages, datavideos] = await Promise.all([
                  imagesResponse.json(),
                  videosResponse.json()
                ]);
                
                console.log("data", dataimages, "vide", datavideos);
                if (imagesResponse.status === 500 || videosResponse.status === 500) {
                    navigate("/error", { state: { message: "Something went wrong. Please try again later." } });
                    return;
                } else {
                    if (!imagesResponse.ok && imagesResponse.status !== 500 || !videosResponse.ok && videosResponse.status !== 500) {
                        setError(dataimages.message || datavideos.message || "Something went wrong"); 
                        return;
                    }
                } 

                setImages(dataimages.images);
                setVideos(datavideos.videos);
                
            } catch(err) {
                navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
            } finally {
                setLoading(false);
            }
        };

        fetchMedias();
    }, [id]);

    function handleSearch(e) {
        e.preventDefault();
        
        if (images || videos) {
            const imageResults = images.filter(i => i.caption.toLowerCase() === search.toLowerCase());
            const videoResults = videos.filter(v => v.caption.toLowerCase() === search.toLowerCase());
            setImageSearchResults(imageResults);
            setVideoSearchResults(videoResults)      
        }
    }

    useEffect(() => {
        if (search.trim() === "") {
            setImageSearchResults([]);
            setVideoSearchResults([]);
        }
    }, [search]);
    

        

    async function likeMedia(e, name, id) {
        e.preventDefault();
        setError("");
        setLikeLoadingId(id);

        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/${name}/${id}/like/love`, {
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
             
        }  catch(err) {
            navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
            setLikeLoadingId(null);
        }
    };

    // Toggle show/hide comments
    function toggleComments(tweetId) {
        setVisibleComments((prev) => ({
        ...prev,
        [tweetId]: !prev[tweetId],
        }));
    }

    return (
        <div>
            {loading ? (
                <p>loading.. please wait</p>
            ): (
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
                    <GalleryList
                        images={imageSearchResults.length > 0 ? imageSearchResults : images}
                        videos={videoSearchResults.length > 0 ? videoSearchResults: videos}
                        likeMedia={likeMedia}
                        likeLoadingId={likeLoadingId}
                        toggleComments={toggleComments}             
                        visibleComments={visibleComments}    
                    />
                </div>
            )}
        {error && <p>{error}</p>}
        </div>
    );
}

function GalleryList({ images, videos, likeMedia, likeLoadingId, toggleComments, visibleComments }) {
    
    return (
        <div>
            {images
            ?.filter(image => image.collectionId == null)
            .map(image => (
                <div key={image.id}>
                <ul>
                    <li>{image.uploadedAt}</li>
                    <li>
                    <img src={image.url} style={{ width: "200px" }} alt={image.caption} />
                    </li>
                    <li>{image.caption}</li>
                    <button onClick={() => toggleComments(image.id)}>
                    {visibleComments[image.id]
                        ? `Hide Comments (${image._count.comments})`
                        : `Show Comments (${image._count.comments})`}
                    </button>
                    <button
                    onClick={(e) => likeMedia(e, "images", image.id)}
                    disabled={likeLoadingId === image.id}
                    >
                    {image.likedByCurrentUser ? "💔 Unlike" : "❤️ Like"} {image._count?.likes || 0}
                    </button>
                </ul>
                {visibleComments[image.id] && (
                    <section className="comments-section">
                        <h3>Comments</h3>
                        <CommentList imageId={image.id} contentOwnerId={image.userId} />
                    </section>
                )}
                </div>
            ))}

            { videos?.length > 0 && (
                videos.map(video => (
                    (video.collectionId === null) && (
                        <div key={video.id}>
                            <ul>
                                <li>{video.uploadedAt}</li>
                                <li>
                                    <video 
                                        src={video.url} 
                                        controls 
                                        style={{ width: "200px" }} 
                                    />
                                </li>
                                <li>{video.caption}</li>
                                <button onClick={() => toggleComments(video.id)}>
                                {visibleComments[video.id]
                                    ? `Hide Comments (${video._count.comments})`
                                    : `Show Comments (${video._count.comments})`}
                                </button>
                                <li>
                                    <button
                                        onClick={(e) => likeMedia(e, "videos", video.id)}
                                        disabled={likeLoadingId === video.id}
                                    >
                                        {video.likedByCurrentUser ? "💔 Unlike" : "❤️ Like"} {video._count?.likes || 0}
                                    </button>
                                </li>
                            </ul>
                            {visibleComments[video.id] && (
                                <section className="comments-section">
                                    <h3>Comments</h3>
                                    <CommentList videoId={video.id} contentOwnerId={video.userId} />
                                </section>
                            )}
                        </div>
                    ) 
                )))
            }
        </div>
    )
}

export default Gallery;
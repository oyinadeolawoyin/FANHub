import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Delete from "../delete/delete";

function CollectionPage() {
    const { id } = useParams();
    const [collection, setCollection] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState("");
    const [videos, setVideos] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deletmessage, setDeletemessage] = useState("");
    
    useEffect(() => {
        if (collection) {
            setImages(collection.images || []);
            setVideos(collection.videos || []);
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
                
                if (response.status === 500) {
                    navigate("/error", { state: { message: data.message || "Process failed" } });
                    return;
                } else {
                    if (!response.ok && response.status !== 500) {
                        setError(data.message); 
                        return;
                    }
                } 

                setCollection(data.collection);
                
            } catch(err) {
                navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
            } finally {
                setLoading(false);
            }
        };

        fetchCollection();
    }, [id]);

    async function handleDeleteImage(id) {
        setDeleteLoading(true);
        try{
            const message = await Delete(`https://fanhub-server.onrender.com/api/gallery/images/${id}`);
            setDeletemessage(message);
            setImages(prev => prev.filter(s => Number(s.id) !== Number(id)))
        } catch(err) {
            navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
            setDeleteLoading(false);
            setDeletemessage("");
        } 
    }

    async function handleDeleteVideo(id) {
        setDeleteLoading(true);
        try{
            const message = await Delete(`https://fanhub-server.onrender.com/api/gallery/videos/${id}`);
            setDeletemessage(message);
            setVideos(prev => prev.filter(s => Number(s.id) !== Number(id)))
        } catch(err) {
            navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
            setDeleteLoading(false);
            setDeletemessage("");
        }
    }
        

    return (
        <div>
            {error && <p>{error}</p>}
            {loading ? (
                <p>loading... please wait!</p>
            ) : (
                <div>
                    {collection && (
                        <div>
                            <header>
                                <li><img style={{ width: "200px" }} src={collection.img} /></li>
                                <li>{collection.name}</li>
                                <li>{collection.description}</li>
                                <li>{collection.tags}</li>
                                <li>{collection.status}</li>
                                <li>{collection.views.length} Views</li>
                                <li>{collection?.likes.length} Likes</li>
                                <li>{collection?.review.length} Reviews</li>
                            </header>

                            <main>
                                {images.length === 0 && videos.length === 0 ? (
                                    <p>No media yet!</p>
                                ) : (
                                    <div>
                                        {images.map(image => (
                                            <div key={image.id}>
                                                <li>{image.uploadedAt}</li>
                                                <li>
                                                    <img
                                                    src={image.url}
                                                    alt={image.caption}
                                                    style={{ width: "200px" }}
                                                    />
                                                </li>
                                                <li>{image.caption}</li>
                                                <button type="submit" disabled={deleteLoading}
                                                    onClick={() => {
                                                    const confirmed = window.confirm("Are you sure you want to delete this image?");
                                                    if (confirmed) {
                                                        handleDeleteImage(image.id);
                                                    }
                                                    }}
                                                >
                                                    {deleteLoading ? "Loading..." : "Delete" || deletmessage !== "" && {deletmessage} }
                                                </button>
                                            </div>
                                        ))}

                                        {videos.map(video => (
                                            <div key={video.id}>
                                                <li>{video.uploadedAt}</li>
                                                <li>
                                                    <video
                                                    src={video.url}
                                                    controls
                                                    style={{ width: "200px" }}
                                                    />
                                                </li>
                                                <li>{video.caption}</li>
                                                <button type="submit" disabled={deleteLoading}
                                                    onClick={() => {
                                                    const confirmed = window.confirm("Are you sure you want to delete this video?");
                                                    if (confirmed) {
                                                        handleDeleteVideo(video.id);
                                                    }
                                                    }}
                                                >
                                                    {deleteLoading ? "Loading..." : "Delete" || deletmessage !== "" && {deletmessage} }
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </main>
                        </div>
                    )}
                </div>
            )}
            
        </div>
    );
}

export default CollectionPage;
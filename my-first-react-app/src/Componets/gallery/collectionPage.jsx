import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCollections } from "./collectionContext";
import Delete from "../delete/delete";

function CollectionPage() {
    const { id } = useParams();
    const { collections } = useCollections();
    const [images, setImages] = useState("");
    const [videos, setVideos] = useState("");
    
    const collection = collections.find(collectionElement => collectionElement.id == id);
    
    console.log("collection", collection);
    useEffect(() => {
        if (collection) {
            setImages(collection.images || []);
            setVideos(collection.videos || []);
        }
    }, [collection]);

    console.log("imge", images, "video:", videos);
    async function handleDeleteImage(id) {
        try{
            const message = await Delete(`https://fanhub-server.onrender.com/api/gallery/images/${id}`);
            alert(message);
            setImages(prev => prev.filter(s => s.id !== id))
        } catch(err) {
            console.log("Failed to delete:", err.message);
        } 
    }

    async function handleDeleteVideo(id) {
        try{
            const message = await Delete(`https://fanhub-server.onrender.com/api/gallery/videos/${id}`);
            alert(message);
            setVideos(prev => prev.filter(s => s.id !== id))
        } catch(err) {
            console.log("Failed to delete:", err.message);
        } 
    }
        

    return (
        <div>
            {collection && (
                <header>
                    <li><img style={{ width: "200px" }} src={collection.img} /></li>
                    <li>{collection.name}</li>
                    <li>{collection.description}</li>
                    <li>{collection.tags}</li>
                    <li>{collection.status}</li>
                    <li>likes: {collection?.likes?.length}</li>
                    <li>Reviews: {collection?.review?.length}</li>
                </header>
            )}
                
            <main>
                {images.length === 0 && videos.length === 0 ? (
                    <p>No media yet!</p>
                ) : (
                    <>
                    {images.map(image => (
                        <div key={`image-${image.id}`}>
                        <li>{image.uploadedAt}</li>
                        <li>
                            <img
                            src={image.url}
                            alt={image.caption}
                            style={{ width: "200px" }}
                            />
                        </li>
                        <li>{image.caption}</li>
                        <button
                            onClick={() => {
                            const confirmed = window.confirm("Are you sure you want to delete this image?");
                            if (confirmed) {
                                handleDeleteImage(image.id);
                            }
                            }}
                        >
                            Delete
                        </button>
                        </div>
                    ))}

                    {videos.map(video => (
                        <div key={`video-${video.id}`}>
                        <li>{video.uploadedAt}</li>
                        <li>
                            <video
                            src={video.url}
                            controls
                            style={{ width: "200px" }}
                            />
                        </li>
                        <li>{video.caption}</li>
                        <button
                            onClick={() => {
                            const confirmed = window.confirm("Are you sure you want to delete this video?");
                            if (confirmed) {
                                handleDeleteVideo(video.id);
                            }
                            }}
                        >
                            Delete
                        </button>
                        </div>
                    ))}
                    </>
                )}
            </main>
        </div>
    );
}

export default CollectionPage;
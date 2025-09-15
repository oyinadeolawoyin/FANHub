import { useState, useEffect } from "react";
import { useAuth } from "../auth/authContext";
import Delete from "../delete/delete";

function Images() {
    const { user } = useAuth();
    const [images, setImages] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
            if (!user || !user.id) return; 
            async function fetchImages() {
                setLoading(true);
                setError("");
                try {
                    const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/images/${user.id}`, {
                        method: "GET",
                        credentials: "include",
                    });
                    
                    const data = await response.json();
            
                    if (!response.ok) {
                        setError(data.message || "Something is wrong. Try again!");
                        console.log(data.message)
                        return;
                    }
            
                    setImages(data.images);  
                
            
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
            fetchImages();
    }, [user]);    

    async function handleDeleteImage(id) {
            try{
                const message = await Delete(`https://fanhub-server.onrender.com/api/gallery/images/${id}`);
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

            {images && (
                images.length > 0 ? (
                    images.map((image) => (
                    <div key={image.image.id}>
                        <li>{image?.image.uploadedAt} likes: {image.likes.length} comments: {image.comments.length}</li>
                        <li>
                        <img 
                            src={image.image.url} 
                            alt={image.image.caption} 
                            style={{ width: "200px" }} 
                        />
                        </li>
                        <li>{image.image.caption}</li>
                        <button
                        onClick={() => {
                            const confirmed = window.confirm("Are you sure you want to delete this image?");
                            if (confirmed) {
                            handleDeleteImage(image.image.id);
                            }
                        }}
                        >
                        Delete
                        </button>
                    </div>
                    ))
                ) : (
                    <p>No images yet!</p>
                )
            )}
        </div>
    );
}

export default Images;
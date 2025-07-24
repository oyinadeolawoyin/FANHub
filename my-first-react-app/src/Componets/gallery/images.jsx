import { useImages } from "./imagesContext";
import Delete from "../delete/delete";

function Images() {
    const { images, setImages, error, loading } = useImages();
    console.log("ooo", images);

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

            { images.length > 0 ? (
                images.map(image => (
                    <div key={image.image.id}>
                        <li>{image.image.uploadedAt} likes: {image.likes.length} comments: {image.comments.length}</li>
                        <li>
                            <img src={image.image.url}
                                style={{ width: "200px"}}
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
                ))): (<p>No images yet!</p>)}
        </div>
    );
}

export default Images;
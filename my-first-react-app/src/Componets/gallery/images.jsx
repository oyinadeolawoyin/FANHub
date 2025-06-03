import { useImages } from "./imagesContext";

function Images() {
    const { images, error, loading } = useImages();
    console.log("ooo", images);
    return (
        <div>
            {loading && <p>loading.. please wait</p>}
            {error && <p>{error}</p>}

            { images.length > 0 ? (
                images.map(image => (
                    <div key={image.id}>
                        <li>{image.image.uploadedAt} likes: {image.likes.length} comments: {image.comments.length}</li>
                        <li>
                            <img src={image.image.url}
                                style={{ width: "200px"}}
                            />
                        </li>
                        <li>{image.image.caption}</li>
                    </div>
                ))): (<p>No images yet!</p>)}
        </div>
    );
}

export default Images;
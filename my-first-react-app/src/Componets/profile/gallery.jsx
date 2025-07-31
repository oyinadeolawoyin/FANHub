import { useImages } from "../gallery/imagesContext";
import { useVideos } from "../gallery/videosContext";

function Gallery() {
    const { images, error, loading } = useImages();
    const { videos } = useVideos();
    console.log("ooo", images, "ppp", videos);
    
    return (
        <div>
            {loading && <p>loading.. please wait</p>}
            {error && <p>{error}</p>}

            { images.length > 0 && (
                images.map(image => (
                    (image.image.collectionId === null) && (
                        <div key={image.image.id}>
                            <li>{image.image.uploadedAt}</li>
                            <li>
                                <img src={image.image.url}
                                    style={{ width: "200px"}}
                                />
                            </li>
                            <li>{image.image.caption}</li>
                            <li>{image.likes.length} likes {image.comments.length} comments</li>
                        </div>
                    )
                )))
            }

            { videos.length > 0 && (
                videos.map(video => (
                    (video.video.collectionId === null) && (
                        <div key={video.video.id}>
                            <li>{video.video.uploadedAt}</li>
                            <li>
                                <video 
                                    src={video.video.url} 
                                    controls 
                                    style={{ width: "200px" }} 
                                />
                            </li>
                            <li>{video.video.caption}</li>
                            <li>{video.likes.length} likes {video.comments.length} comments</li>
                        </div>
                    ) 
                )))
            }
        </div>
    );
}

export default Gallery;
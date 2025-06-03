import { useVideos } from "./videosContext";

function Videos() {
    const { videos, error, loading } = useVideos();
    console.log("ooo", videos);
    return (
        <div>
            {loading && <p>loading.. please wait</p>}
            {error && <p>{error}</p>}

            { videos.length > 0 ? (
                videos.map(video => (
                    <div key={video.id}>
                        <li>{video.video.uploadedAt}</li>
                        <li>
                            <video 
                                src={video.video.url} 
                                controls 
                                style={{ width: "200px" }} 
                            />
                        </li>
                        <li>{video.video.caption}</li>
                    </div>
                ))): (<p>No vidoe yet!</p>)}
        </div>
    );
}

export default Videos;
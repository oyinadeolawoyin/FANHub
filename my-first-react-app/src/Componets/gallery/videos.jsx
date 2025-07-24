import { useVideos } from "./videosContext";
import Delete from "../delete/delete";

function Videos() {
    const { videos, setVideos, error, loading } = useVideos();
    console.log("ooo", videos);


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
            {loading && <p>loading.. please wait</p>}
            {error && <p>{error}</p>}

            { videos.length > 0 ? (
                videos.map(video => (
                    <div key={video.video.id}>
                        <li>{video.video.uploadedAt} likes: {video.likes.length} comments: {video.comments.length} </li>
                        <li>
                            <video 
                                src={video.video.url} 
                                controls 
                                style={{ width: "200px" }} 
                            />
                        </li>
                        <li>{video.video.caption}</li>
                        <button
                            onClick={() => {
                            const confirmed = window.confirm("Are you sure you want to delete this video?");
                            if (confirmed) {
                                handleDeleteVideo(video.video.id);
                            }
                            }}
                        >
                            Delete
                        </button>
                    </div>
                ))): (<p>No vidoe yet!</p>)}
        </div>
    );
}

export default Videos;
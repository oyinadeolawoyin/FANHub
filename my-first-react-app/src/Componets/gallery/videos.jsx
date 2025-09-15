import { useState, useEffect } from "react";
import Delete from "../delete/delete";
import { useAuth } from "../auth/authContext";

function Videos() {
    const [videos, setVideos] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { user } = useAuth()

    useEffect(() => {
        if (!user || !user.id) return;

        async function fetchVideos() {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/videos/${user.id}`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || "Something is wrong. Try again!");
                    console.log(data.message);
                    return;
                }

                console.log("Fetched videos:", data.videos); 
                setVideos(data.videos);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchVideos();
    }, [user]);

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

            { videos && (
                videos.length > 0 ? (
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
                ))): (<p>No vidoe yet!</p>)
            )}
        </div>
    );
}

export default Videos;
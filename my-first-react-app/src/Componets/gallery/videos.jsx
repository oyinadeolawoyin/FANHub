import { useState, useEffect } from "react";
import Delete from "../delete/delete";
import { useAuth } from "../auth/authContext";

function Videos() {
    const { user } = useAuth()
    const [videos, setVideos] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deletmessage, setDeletemessage] = useState("");

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

                if (response.status === 500) {
                    navigate("/error", { state: { message: data.message || "Process failed" } });
                    return;
                } else {
                    if (!response.ok && response.status !== 500) {
                        setError(data.message); 
                        return;
                    }
                } 
        
                setVideos(data.videos);

            } catch (err) {
                navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
            } finally {
                setLoading(false);
            }
        }

        fetchVideos();
    }, [user]);

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
        }
    }

    return (
        <div>
            {loading ? (
                <p>loading.. please wait</p>
            ) : (
                <div>
                    {videos && (
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
                                    <button type="submit" disabled={deleteLoading}
                                        onClick={() => {
                                        const confirmed = window.confirm("Are you sure you want to delete this video?");
                                        if (confirmed) {
                                            handleDeleteVideo(video.video.id);
                                        }
                                        }}
                                    >
                                        {deleteLoading ? "Loading..." : "Delete" || deletmessage !== "" && {deletmessage} }
                                    </button>
                                </div>
                        ))): (
                            <p>No vidoe yet!</p>
                        )
                    )}
                </div>
            )}
            {error && <p>{error}</p>}
        </div>
    );
}

export default Videos;
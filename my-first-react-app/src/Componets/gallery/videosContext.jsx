import { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "../auth/authContext";

const VideosContext = createContext();

export function VideosProvider({ children }) {
    const [videos, setVideos] = useState([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user || !user.id) return;

        async function fetchVideos() {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/videos`, {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data.message || "Something is wrong. Try again!");
                    console.log(data.message);
                    return;
                }

                console.log("Fetched videos:", data.videos); // ✅ raw response
                setVideos(data.videos); // ✅ correctly setting the videos array

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchVideos();
    }, [user]);

    // ✅ log when videos actually change
    // useEffect(() => {
    //     console.log("Updated videos in state:", videos);
    // }, [videos]);

    return (
        <VideosContext.Provider value={{ videos, loading, error }}>
            {children}
        </VideosContext.Provider>
    );
}

export function useVideos() {
    return useContext(VideosContext);
}
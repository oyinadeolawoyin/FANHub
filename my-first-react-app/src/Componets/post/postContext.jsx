import { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "../auth/authContext";

const PostContext = createContext();

export function PostsProvider({ children }) {
    const [posts, setPosts] = useState([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    useEffect(() => {
        if (!user || !user.id) return; 
        async function fetchposts() {
            setLoading(true);
            setError("");
            try {
                const response = await fetch(`https://fanhub-server.onrender.com/api/posts`, {
                    method: "GET",
                    credentials: "include",
                });
                
                const data = await response.json();
        
                if (!response.ok) {
                    setError(data.message || "Something is wrong. Try again!");
                    return;
                }
        
                setPosts(data.posts);  
        
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchposts();
    }, [user]);      

    return(
        <PostContext.Provider value={{ posts, setPosts, loading, error }}>
            {children}
        </PostContext.Provider>
    )
}

export function usePosts() {
    return useContext(PostContext);
}
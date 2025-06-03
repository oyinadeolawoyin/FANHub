import { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "../auth/authContext";

const StoriesContext = createContext();

export function StoriesProvider({ children }) {
    const [stories, setStories] = useState([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    useEffect(() => {
        if (!user || !user.id) return; 
        async function fetchstories() {
            setLoading(true);
            setError("");
            try {
                const response = await fetch(`https://fanhub-server.onrender.com/api/stories`, {
                    method: "GET",
                    credentials: "include",
                });
                
                const data = await response.json();
        
                if (!response.ok) {
                    setError(data.message || "Something is wrong. Try again!");
                    return;
                }
        
                setStories(data.stories);  
        
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchstories();
    }, [user]);      

    return(
        <StoriesContext.Provider value={{ stories, setStories, loading, error }}>
            {children}
        </StoriesContext.Provider>
    )
}

export function useStories() {
    return useContext(StoriesContext);
}
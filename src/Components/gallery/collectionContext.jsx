import { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "../auth/authContext";

const CollectionContext = createContext();

export function CollectionProvider({ children }) {
    const [collections, setCollections] = useState([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    useEffect(() => {
        if (!user || !user.id) return; 
        async function fetchcollections() {
            setLoading(true);
            setError("");
            try {
                const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/collections/${user.id}`, {
                    method: "GET",
                    credentials: "include",
                });
                
                const data = await response.json();
        
                if (!response.ok) {
                    setError(data.message || "Something is wrong. Try again!");
                    return;
                }
        
                setCollections(data.collections);  
        
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchcollections();
    }, [user]);      

    return(
        <CollectionContext.Provider value={{ collections, setCollections, loading, error }}>
            {children}
        </CollectionContext.Provider>
    )
}

export function useCollections() {
    return useContext(CollectionContext);
}
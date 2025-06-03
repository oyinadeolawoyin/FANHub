import { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "../auth/authContext";

const ImagesContext = createContext();

export function ImagesProvider({ children }) {
    const [images, setImages] = useState([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    useEffect(() => {
        if (!user || !user.id) return; 
        async function fetchImages() {
            setLoading(true);
            setError("");
            try {
                const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/images`, {
                    method: "GET",
                    credentials: "include",
                });
                
                const data = await response.json();
        
                if (!response.ok) {
                    setError(data.message || "Something is wrong. Try again!");
                    console.log(data.message)
                    return;
                }
        
                setImages(data.images);  
            
        
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchImages();
    }, [user]);      

    return(
        <ImagesContext.Provider value={{ images, setImages, loading, error }}>
            {children}
        </ImagesContext.Provider>
    )
}

export function useImages() {
    return useContext(ImagesContext);
}
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import GenreSelector from "../genre/genreSelector";

function Homecollections() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [collectionLoading, setCollectionLoading] = useState(false);
    const [error, setError] = useState("");
    const [collections, setCollections] = useState([]);
    const [collectionPage, setCollectionPage] = useState(1);
    const [collectionHasMore, setCollectionHasMore] = useState(true);
    const [search, setSearch] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    

    const [collectionFilters, setCollectionFilters] = useState({
        primarygenre: "mystery",
        secondarygenre: "",
        primarysubgenre: "romance",
        secondarysubgenre: "",
        age: "young adult",
        audience: "general",
        status: "ongoing",
        sort: "recent",
    });
    
    const observerRef = useRef(null);

    useEffect(() => {
        setCollections([]);
        setCollectionPage(1);
        setCollectionHasMore(true);
    }, [collectionFilters]);

    useEffect(() => {
        async function fetchCollections() {
        setError("");
        setCollectionLoading(true);
        try {
            const params = new URLSearchParams({
                page: collectionPage,
                limit: 2,
                primarygenre: collectionFilters.primarygenre,
                secondarygenre: collectionFilters.secondarygenre,
                primarysubgenre: collectionFilters.primarysubgenre,
                secondarysubgenre: collectionFilters.secondarysubgenre,
                audience: collectionFilters.audience,
                age: collectionFilters.age,
                status: collectionFilters.status,
                sort: collectionFilters.sort,
            });
              
            const response = await fetch(`https://fanhub-server.onrender.com/api/home/collections?${params.toString()}`,
            { method: "GET", credentials: "include" }
            );
            const data = await response.json();
            console.log("coll", data);
            if (response.status === 500) {
                navigate("/error", { state: { message: data.message || "Process failed" } });
                return;
            } else {
                if (!response.ok && response.status !== 500) {
                    setError(data.message); 
                    return;
                }
            } 

            // filter duplicates
            setCollections(prev => {
            const newCollections = data.collections.filter(
                c => !prev.some(pc => pc.id === c.id)
            );
            return [...prev, ...newCollections];
            });

            if (collectionPage >= data.pagination.totalPages) setCollectionHasMore(false);
        } catch (err) {
            navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
            setCollectionLoading(false);
        }
    }
    fetchCollections();
    }, [collectionPage, collectionFilters]);

    //Infinite scroll effect
    useEffect(() => {
        if (collectionLoading) return;
    
        const observer = new IntersectionObserver(
            (entries) => {
            if (entries[0].isIntersecting && collectionHasMore) {
                setCollectionPage((prev) => prev + 1);
            }
            },
            { threshold: 0.2 }
        );
    
        const currentTarget = observerRef.current;
        if (currentTarget) observer.observe(currentTarget);
    
        return () => {
            if (currentTarget) observer.unobserve(currentTarget);
        };
    }, [collectionLoading, collectionHasMore]);

    async function handleSearch(e) {
        e.preventDefault();
        setError("");
        setSearchLoading(true);

        try {
            const params = new URLSearchParams({
            query: search,
            page: 1,
            limit: 10,
            });
  
            const response = await fetch(`https://fanhub-server.onrender.com/api/home/collections/search?${params.toString()}`, 
            { method: "GET", credentials: "include" });
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
            
            console.log("datacol", data);
            setCollections(data.collections);
            
        } catch (err) {
            navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
            setSearchLoading(false);
        }
    }

      
    async function view(collectionId) {
        try {
            await fetch(`https://fanhub-server.onrender.com/api/gallery/collections/${collectionId}/view`,
                { method: "POST", credentials: "include" }
            );

            await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/social/readingpoint`,
                { method: "POST", credentials: "include" }
            );

            await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/readingStreak`,
                {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                }
            );
        } catch (err) {
            navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        }
    }

  return (
    <div>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div>
            <form onSubmit={(e) => handleSearch(e, "collection")}>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search collections or authors..."
                />
                <button type="submit" disabled={searchLoading}>
                    {searchLoading ? "Loading..." : "Search"}
                </button>
            </form>
            <div className="p-4">
              <GenreSelector storyFilters={collectionFilters} setStoryFilters={setCollectionFilters}/>
            </div>
            {collections.map((collection, i) => (
                <ul key={collection.id} style={{ marginBottom: "20px", listStyle: "none" }}>
                    <img style={{ width: "200px" }} src={collection.img} alt={collection.name} />
                    <li>{collection.name}</li>
                    <li>{collection.description}</li>
                    <p>{collection.primarygenre} / {collection.secondarygenre}</p>
                    <p>{collection.audience}</p>
                    <p>{collection.age}</p>
                    <li>{collection.status}</li>
                    <li>{collection._count.views} Views</li>
                    <li>{collection._count.likes} likes</li>
                    <li>{collection._count.review} reviews</li>
                    <button
                        onClick={() => {
                        view(collection.id);
                        navigate(`/gallery/${collection.id}`);
                        }}
                    >
                        View
                    </button>
                    {i === collections.length - 1 && (
                    <div ref={observerRef} style={{ height: "1px" }}></div>
                    )}
                </ul>
            ))}
              
            {collectionLoading && <p>Loading... </p>}
            {!collectionHasMore && <p>No more collections to load</p>}
            
        </div>
    </div>
  );
}




export default Homecollections;
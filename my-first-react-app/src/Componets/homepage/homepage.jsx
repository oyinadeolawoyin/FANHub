import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";

function Homepage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [storyLoading, setStoryLoading] = useState(false);
    const [collectionLoading, setCollectionLoading] = useState(false);
    const [error, setError] = useState("");
    const [stories, setStories] = useState([]);
    const [collections, setCollections] = useState([]);
    const [storyPage, setStoryPage] = useState(1);
    const [collectionPage, setCollectionPage] = useState(1);
    const [storyHasMore, setStoryHasMore] = useState(true);
    const [collectionHasMore, setCollectionHasMore] = useState(true);
    const [search, setSearch] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [storyFilters, setStoryFilters] = useState({
        genre: "",
        status: "",
        type: "",
        sort: "recent",
    });

    const [collectionFilters, setCollectionFilters] = useState({
        genre: "",
        status: "",
        type: "",
        sort: "recent",
    });
    
    useEffect(() => {
        setStories([]);
        setStoryPage(1);
        setStoryHasMore(true);
    }, [storyFilters]);

    useEffect(() => {
        setCollections([]);
        setCollectionPage(1);
        setCollectionHasMore(true);
    }, [collectionFilters]);
      
    useEffect(() => {
        async function fetchStories() {
        setError("");
        setStoryLoading(true);
        try {
            const params = new URLSearchParams({
                page: storyPage,
                limit: 5,
                genre: storyFilters.genre,
                status: storyFilters.status,
                type: storyFilters.type,
                sort: storyFilters.sort,
            });
            const response = await fetch(`https://fanhub-server.onrender.com/api/home/stories?${params.toString()}`,
            { method: "GET", credentials: "include" }
            );
            const data = await response.json();
            if (!response.ok) {
                setError(data.message);
                return;
            }

            // filter duplicates
            setStories(prev => {
                const newStories = data.stories.filter(
                    s => !prev.some(ps => ps.id === s.id)
                );
                return [...prev, ...newStories];
            });

            if (storyPage >= data.pagination.totalPages) setStoryHasMore(false);
        } catch (err) {
            console.log(err);
            alert("Something went wrong. Please try again.");
        } finally {
            setStoryLoading(false);
        }
        }
        fetchStories();
    }, [storyPage, storyFilters]);

    useEffect(() => {
        async function fetchCollections() {
        setError("");
        setCollectionLoading(true);
        try {
            const params = new URLSearchParams({
                page: collectionPage,
                limit: 5,
                genre: collectionFilters.genre,
                status: collectionFilters.status,
                type: collectionFilters.type,
                sort: collectionFilters.sort,
            });
            const response = await fetch(`https://fanhub-server.onrender.com/api/home/collections?${params.toString()}`,
            { method: "GET", credentials: "include" }
            );
            const data = await response.json();
            if (!response.ok) {
            setError(data.message);
            return;
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
            console.log(err);
            alert("Something went wrong. Please try again.");
        } finally {
            setCollectionLoading(false);
        }
        }
        fetchCollections();
    }, [collectionPage, collectionFilters]);


    async function handleSearch(e, type) {
        e.preventDefault();
        setError("");
        setSearchLoading(true);

        try {
            const params = new URLSearchParams({
            query: search,
            page: 1,
            limit: 10,
            });

            if (type === "story") {
            const response = await fetch(`https://fanhub-server.onrender.com/api/home/stories/search?${params.toString()}`,
            { method: "GET", credentials: "include" });
            const data = await response.json();

            if (!response.ok) {
                setError(data.message);
                return;
            }
            console.log("data", data);
            setStories(data.stories); // replace instead of appending
            } else if (type === "collection") {
            const response = await fetch(`https://fanhub-server.onrender.com/api/home/collections/search?${params.toString()}`, 
            { method: "GET", credentials: "include" });
            const data = await response.json();

            if (!response.ok) {
                setError(data.message);
                return;
            }
            console.log("datacol", data);
            setCollections(data.collections);
            }
        } catch (err) {
            console.log(err);
            alert("Something went wrong. Please try again.");
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
            console.log(err);
            alert("Something went wrong. Please try again.");
        }
    }

  return (
    <div>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div>
            <form onSubmit={(e) => handleSearch(e, "story")}>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search stories or authors..."
                />
                <button type="submit">Search Stories</button>
            </form>
            <div className="p-4">
                {/* Dropdowns */}
                <select onChange={(e) => setStoryFilters(f => ({ ...f, genre: e.target.value }))}>
                    <option value="Romance">Romance</option>
                    <option value="fantasy">Fantasy</option>
                    <option value="Horror">Horror</option>
                    <option value="mystery">Mystery</option>
                </select>

                <select onChange={(e) => setStoryFilters(f => ({ ...f, status: e.target.value }))}>
                    <option value="completed">Completed</option>
                    <option value="ongoing">Ongoing</option>
                </select>

                <select onChange={(e) => setStoryFilters(f => ({ ...f, type: e.target.value }))}>
                    <option value="novel">Novel</option>
                    <option value="short story">Short Story</option>
                    <option value="Flash stories">Flash Story</option>
                </select>

                <select onChange={(e) => setStoryFilters(f => ({ ...f, sort: e.target.value }))}>
                    <option value="popular">Most Popular</option>   
                    <option value="recent">Recently Updated</option>  
                </select>
            </div>
            {storyLoading && <p>Loading stories...</p>}
            <ul>
            {stories.map(story => (
                <li key={story.id}>
                <img style={{ width: "200px" }} src={story.imgUrl} />
                <p>{story.title}</p>
                <p>{story.summary}</p>
                <p>{story.tags}</p>
                <p>{story.status}</p>
                <p>{story.type}</p>
                <button onClick={() => navigate(`/stories/${story.id}`)}>View</button>
                </li>
            ))}
            </ul>
            {storyHasMore && !storyLoading && (
            <button onClick={() => setStoryPage(prev => prev + 1)}>Show More Stories</button>
            )}
        </div>

        <div>
            <form onSubmit={(e) => handleSearch(e, "collection")}>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search collections or authors..."
                />
                <button type="submit">Search Collections</button>
            </form>
            <div className="p-4">
                {/* Dropdowns */}
                <select onChange={(e) => setCollectionFilters(f => ({ ...f, genre: e.target.value }))}>
                    <option value="mystery">Mystery</option>
                    <option value="fantasy">Fantasy</option>
                    <option value="Romance">Romance</option>
                    <option value="Tragedy">Tragedy</option>
                    <option value="horror">Horror</option>  
                </select>

                <select onChange={(e) => setCollectionFilters(f => ({ ...f, status: e.target.value }))}>
                    <option value="Completed">Completed</option>
                    <option value="ongoing">Ongoing</option>    
                </select>

                <select onChange={(e) => setCollectionFilters(f => ({ ...f, sort: e.target.value }))}>
                    <option value="popular">Most Popular</option>
                    <option value="recent">Recently Updated</option>   
                </select>
            </div>
            {collectionLoading && <p>Loading collections...</p>}
            <ul>
            {collections.map(collection => (
                <li key={collection.id} style={{ marginBottom: "20px", listStyle: "none" }}>
                <img style={{ width: "200px" }} src={collection.img} alt={collection.name} />
                <p>{collection.name}</p>
                <p>{collection.description}</p>
                <p>{collection.tags}</p>
                <p>{collection.status}</p>
                <p>{collection.views.length} Views</p>
                <button
                    onClick={() => {
                    view(collection.id);
                    navigate(`/gallery/${collection.id}`);
                    }}
                >
                    View
                </button>
                </li>
            ))}
            </ul>
            {collectionHasMore && !collectionLoading && (
            <button onClick={() => setCollectionPage(prev => prev + 1)}>Show More Collections</button>
            )}
        </div>
    </div>
  );
}

export default Homepage;
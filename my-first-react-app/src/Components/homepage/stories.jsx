import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import GenreSelector from "../genre/genreSelector";
import { useAuth } from "../auth/authContext";

function Homestories() {
    const navigate = useNavigate();
    const [storyLoading, setStoryLoading] = useState(false);
    const [error, setError] = useState("");
    const [stories, setStories] = useState([]);
    const [storyPage, setStoryPage] = useState(1);
    const [storyHasMore, setStoryHasMore] = useState(true);
    const [search, setSearch] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const { user } = useAuth();

    const observerRef = useRef(null);

    const [storyFilters, setStoryFilters] = useState({
        primarygenre: "romance",
        secondarygenre: "",
        primarysubgenre: "mystery",
        secondarysubgenre: "",
        age: "young adult",
        audience: "general",
        status: "ongoing",
        type: "novel",
        sort: "recent",
    });

    useEffect(() => {
        setStories([]);
        setStoryPage(1);
        setStoryHasMore(true);
    }, [storyFilters]);

      
    useEffect(() => {
        async function fetchStories() {
        setError("");
        setStoryLoading(true);
        try {
            const params = new URLSearchParams({
                page: storyPage,
                limit: 3,
                primarygenre: storyFilters.primarygenre,
                secondarygenre: storyFilters.secondarygenre,
                primarysubgenre: storyFilters.primarysubgenre,
                secondarysubgenre: storyFilters.secondarysubgenre,
                audience: storyFilters.audience,
                age: storyFilters.age,
                status: storyFilters.status,
                type: storyFilters.type,
                sort: storyFilters.sort,
            });
              
            const response = await fetch(`https://fanhub-server.onrender.com/api/home/stories?${params.toString()}`,
            { method: "GET", credentials: "include" }
            );
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

            const storiesData = data.stories || [];
            console.log("stories", storiesData);
            // filter duplicates
            setStories(prev => {
                const newStories = storiesData.filter(
                    s => !prev.some(ps => ps.id === s.id)
                );
                return [...prev, ...newStories];
            });
            console.log("pagination info:", data.pagination);

            const totalPages = data.pagination?.totalPages || 1;
            if (storyPage >= totalPages) setStoryHasMore(false);

        } catch (err) {
            navigate("/error", { state: { message:  err.message } });
        } finally {
            setStoryLoading(false);
        }
        }
        fetchStories();
    }, [storyPage, storyFilters]);

    //Infinite scroll effect
    useEffect(() => {
        if (storyLoading) return;
    
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting && storyHasMore) {
              setStoryPage((prev) => prev + 1);
            }
          },
          { threshold: 0.2 }
        );
    
        const currentTarget = observerRef.current;
        if (currentTarget) observer.observe(currentTarget);
    
        return () => {
          if (currentTarget) observer.unobserve(currentTarget);
        };
    }, [storyLoading, storyHasMore]);

    async function handleSearch(e) {
        e.preventDefault();
        setError("");
        setSearchLoading(true);

        try {
            const params = new URLSearchParams({
            query: search,
            page: 1,
            limit: 5,
            });

            const response = await fetch(`https://fanhub-server.onrender.com/api/home/stories/search?${params.toString()}`,
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

            console.log("data", data);
            setStories(data.stories); // replace instead of appending

            
        } catch (err) {
            navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
            setSearchLoading(false);
        }
    }

    async function view(storyId) {
        try {
            await fetch(`https://fanhub-server.onrender.com/api/stories/${storyId}/view`,
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
            <form onSubmit={(e) => handleSearch(e)}>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search stories or authors..."
                />
                <button type="submit" disabled={searchLoading}>
                    {searchLoading ? "Loading..." : "Search"}
                </button>
            </form>
            <div className="p-4">
                {/* Dropdowns */}
                <GenreSelector storyFilters={storyFilters} setStoryFilters={setStoryFilters}/>
                
                <select onChange={(e) => setStoryFilters(f => ({ ...f, type: e.target.value }))}>
                    <option value="novel">Novel</option>
                    <option value="short story">Short Story</option>
                    <option value="Flash story">Flash Story</option>
                </select>
            </div>
            <ul>
                {stories.map((story, i) => (
                <li key={story.id}>
                    <img style={{ width: "200px" }} src={story.imgUrl} />
                    <p>{story.title}</p>
                    <p>{story.summary}</p>
                    <p>{story.primarygenre} / {story.secondarygenre}</p>
                    <p>{story.audience}</p>
                    <p>{story.age}</p>
                    <p>{story.status}</p>
                    <p>{story.type}</p>
                    <p>{story._count.views} views</p>
                    <p>{story._count.likes} likes</p>
                    <p>{story._count.reviews} reviews</p>
                    <button
                        onClick={() => {
                        view(story.id);
                        navigate(`/stories/${story.id}`);
                        }}
                    >
                        View
                    </button>

                    {/*Only show this under the LAST story */}
                    {i === stories.length - 1 && (
                    <div ref={observerRef} style={{ height: "1px" }}></div>
                    )}
                </li>
                ))}
            </ul>
            
            {storyLoading && <p>Loading....</p>}

            {!storyHasMore && <p>No more stories to load</p>}

        </div>
    </div>
  );
}

export default Homestories
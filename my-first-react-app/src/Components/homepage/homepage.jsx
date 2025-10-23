import { Outlet, Link } from "react-router-dom";

function Homepage() {
  
  return (
    <div>
      <header>
        <nav>
          <ul>
            <li><Link to="homestories">Stories</Link></li>
            <li><Link to="homecollections">Collections</Link></li>
            
          </ul>
        </nav>
      </header>

      <main>
         <Outlet /> 
      </main>
    </div>
  );
};

export default Homepage;

// function Homepage() {
//     const { user } = useAuth();
//     const navigate = useNavigate();
//     const [storyLoading, setStoryLoading] = useState(false);
//     const [collectionLoading, setCollectionLoading] = useState(false);
//     const [error, setError] = useState("");
//     const [stories, setStories] = useState([]);
//     const [collections, setCollections] = useState([]);
//     const [storyPage, setStoryPage] = useState(1);
//     const [collectionPage, setCollectionPage] = useState(1);
//     const [storyHasMore, setStoryHasMore] = useState(true);
//     const [collectionHasMore, setCollectionHasMore] = useState(true);
//     const [search, setSearch] = useState("");
//     const [searchLoading, setSearchLoading] = useState(false);

//     const [storyFilters, setStoryFilters] = useState({
//         primarygenre: "",
//         secondarygenre: "",
//         primarysubgenre: [],
//         secondarysubgenre: [],
//         age: "",
//         audience: "",
//         status: "",
//         type: "",
//         sort: "recent",
//     });

//     const [collectionFilters, setCollectionFilters] = useState({
//         primarygenre: "",
//         secondarygenre: "",
//         primarysubgenre: [],
//         secondarysubgenre: [],
//         age: "",
//         audience: "",
//         genre: "",
//         status: "",
//         sort: "recent",
//     });
    
//     useEffect(() => {
//         setStories([]);
//         setStoryPage(1);
//         setStoryHasMore(true);
//     }, [storyFilters]);

//     useEffect(() => {
//         setCollections([]);
//         setCollectionPage(1);
//         setCollectionHasMore(true);
//     }, [collectionFilters]);
      
//     useEffect(() => {
//         async function fetchStories() {
//         setError("");
//         setStoryLoading(true);
//         try {
//             const params = new URLSearchParams({
//                 page: storyPage,
//                 limit: 5,
//                 primarygenre: storyFilters.primarygenre,
//                 secondarygenre: storyFilters.secondarygenre,
//                 primarysubgenre: storyFilters.primarysubgenre.join(","),
//                 secondarysubgenre: storyFilters.secondarysubgenre.join(","),
//                 audience: storyFilters.audience,
//                 age: storyFilters.age,
//                 status: storyFilters.status,
//                 type: storyFilters.type,
//                 sort: storyFilters.sort,
//             });
              
//             const response = await fetch(`https://fanhub-server.onrender.com/api/home/stories?${params.toString()}`,
//             { method: "GET", credentials: "include" }
//             );
//             const data = await response.json();
            
//             if (response.status === 500) {
//                 navigate("/error", { state: { message: data.message || "Process failed" } });
//                 return;
//             } else {
//                 if (!response.ok && response.status !== 500) {
//                     setError(data.message); 
//                     return;
//                 }
//             } 

//             // filter duplicates
//             setStories(prev => {
//                 const newStories = data.stories.filter(
//                     s => !prev.some(ps => ps.id === s.id)
//                 );
//                 return [...prev, ...newStories];
//             });

//             if (storyPage >= data.pagination.totalPages) setStoryHasMore(false);
//         } catch (err) {
//             navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
//         } finally {
//             setStoryLoading(false);
//         }
//         }
//         fetchStories();
//     }, [storyPage, storyFilters]);

//     useEffect(() => {
//         async function fetchCollections() {
//         setError("");
//         setCollectionLoading(true);
//         try {
//             const params = new URLSearchParams({
//                 page: collectionPage,
//                 limit: 5,
//                 primarygenre: collectionFilters.primarygenre,
//                 secondarygenre: collectionFilters.secondarygenre,
//                 primarysubgenre: collectionFilters.primarysubgenre.join(","),
//                 secondarysubgenre: collectionFilters.secondarysubgenre.join(","),
//                 audience: collectionFilters.audience,
//                 age: collectionFilters.age,
//                 status: collectionFilters.status,
//                 sort: storyFilters.sort,
//             });
              
//             const response = await fetch(`https://fanhub-server.onrender.com/api/home/collections?${params.toString()}`,
//             { method: "GET", credentials: "include" }
//             );
//             const data = await response.json();
            
//             if (response.status === 500) {
//                 navigate("/error", { state: { message: data.message || "Process failed" } });
//                 return;
//             } else {
//                 if (!response.ok && response.status !== 500) {
//                     setError(data.message); 
//                     return;
//                 }
//             } 

//             // filter duplicates
//             setCollections(prev => {
//             const newCollections = data.collections.filter(
//                 c => !prev.some(pc => pc.id === c.id)
//             );
//             return [...prev, ...newCollections];
//             });

//             if (collectionPage >= data.pagination.totalPages) setCollectionHasMore(false);
//         } catch (err) {
//             navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
//         } finally {
//             setCollectionLoading(false);
//         }
//         }
//         fetchCollections();
//     }, [collectionPage, collectionFilters]);


//     async function handleSearch(e, type) {
//         e.preventDefault();
//         setError("");
//         setSearchLoading(true);

//         try {
//             const params = new URLSearchParams({
//             query: search,
//             page: 1,
//             limit: 10,
//             });

//             if (type === "story") {

//             const response = await fetch(`https://fanhub-server.onrender.com/api/home/stories/search?${params.toString()}`,
//             { method: "GET", credentials: "include" });
//             const data = await response.json();

//             if (!response.ok) {
//                 setError(data.message);
//                 return;
//             }

//             console.log("data", data);
//             setStories(data.stories); // replace instead of appending

//             } else if (type === "collection") {
//             const response = await fetch(`https://fanhub-server.onrender.com/api/home/collections/search?${params.toString()}`, 
//             { method: "GET", credentials: "include" });
//             const data = await response.json();

//             if (!response.ok) {
//                 setError(data.message);
//                 return;
//             }
            
//             console.log("datacol", data);
//             setCollections(data.collections);
//             }
//         } catch (err) {
//             navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
//         } finally {
//             setSearchLoading(false);
//         }
//     }

      
//     async function view(collectionId) {
//         try {
//             await fetch(`https://fanhub-server.onrender.com/api/gallery/collections/${collectionId}/view`,
//                 { method: "POST", credentials: "include" }
//             );

//             await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/social/readingpoint`,
//                 { method: "POST", credentials: "include" }
//             );

//             await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/readingStreak`,
//                 {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 credentials: "include",
//                 }
//             );
//         } catch (err) {
//             navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
//         }
//     }

//   return (
//     <div>
//         {error && <p style={{ color: "red" }}>{error}</p>}

//         <div>
//             <form onSubmit={(e) => handleSearch(e, "story")}>
//                 <input
//                     type="text"
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     placeholder="Search stories or authors..."
//                 />
//                 <button type="submit">Search Stories</button>
//             </form>
//             <div className="p-4">
//                 {/* Dropdowns */}
//                 <GenreSelector storyFilters={storyFilters} setStoryFilters={setStoryFilters}/>
                
//                 <select onChange={(e) => setCollectionFilters(f => ({ ...f, audience: e.target.value }))}>
//                     <option value="">Select Audience</option>
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                     <option value="genral">General</option>
//                 </select>
            
//                 <select onChange={(e) => setCollectionFilters(f => ({ ...f, age: e.target.value }))}>
//                     <option value="">Select Age Group</option>
//                     <option value="kids">Kids</option>
//                     <option value="teen">Teen</option>
//                     <option value="young adult">Young Adult</option>
//                     <option value="adult">Adult</option>
//                 </select>

//                 <select onChange={(e) => setStoryFilters(f => ({ ...f, status: e.target.value }))}>
//                     <option value="completed">Completed</option>
//                     <option value="ongoing">Ongoing</option>
//                 </select>

//                 <select onChange={(e) => setStoryFilters(f => ({ ...f, type: e.target.value }))}>
//                     <option value="novel">Novel</option>
//                     <option value="short story">Short Story</option>
//                     <option value="Flash stories">Flash Story</option>
//                 </select>

//                 <select onChange={(e) => setStoryFilters(f => ({ ...f, sort: e.target.value }))}>
//                     <option value="popular">Most Popular</option>   
//                     <option value="recent">Recently Updated</option>  
//                 </select>
//             </div>
//             {storyLoading && <p>Loading stories...</p>}
//             <ul>
//             {stories.map(story => (
//                 <li key={story.id}>
//                 <img style={{ width: "200px" }} src={story.imgUrl} />
//                 <p>{story.title}</p>
//                 <p>{story.summary}</p>
//                 <p>{story.primarygenre} / {story.secondarygenre}</p>
//                 <p>{story.audience}</p>
//                 <p>{story.age}</p>
//                 <p>{story.status}</p>
//                 <p>{story.type}</p>
//                 <button onClick={() => navigate(`/stories/${story.id}`)}>View</button>
//                 </li>
//             ))}
//             </ul>
//             {storyHasMore && !storyLoading && (
//             <button onClick={() => setStoryPage(prev => prev + 1)}>Show More Stories</button>
//             )}
//         </div>

//         <div>
//             <form onSubmit={(e) => handleSearch(e, "collection")}>
//                 <input
//                     type="text"
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     placeholder="Search collections or authors..."
//                 />
//                 <button type="submit">Search Collections</button>
//             </form>
//             <div className="p-4">
//               <GenreSelector storyFilters={collectionFilters} setStoryFilters={setCollectionFilters}/>
            
//               <select onChange={(e) => setCollectionFilters(f => ({ ...f, audience: e.target.value }))}>
//                 <option value="">Select Audience</option>
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//                 <option value="genral">General</option>
//               </select>
        
//               <select onChange={(e) => setCollectionFilters(f => ({ ...f, age: e.target.value }))}>
//                 <option value="">Select Age Group</option>
//                 <option value="kids">Kids</option>
//                 <option value="teen">Teen</option>
//                 <option value="young adult">Young Adult</option>
//                 <option value="adult">Adult</option>
//               </select>
            
//                 <select onChange={(e) => setCollectionFilters(f => ({ ...f, status: e.target.value }))}>
//                     <option value="Completed">Completed</option>
//                     <option value="ongoing">Ongoing</option>    
//                 </select>

//                 <select onChange={(e) => setCollectionFilters(f => ({ ...f, sort: e.target.value }))}>
//                     <option value="popular">Most Popular</option>
//                     <option value="recent">Recently Updated</option>   
//                 </select>
//             </div>
//             {collectionLoading && <p>Loading collections...</p>}
//             <ul>
//             {collections.map(collection => (
//                 <li key={collection.id} style={{ marginBottom: "20px", listStyle: "none" }}>
//                 <img style={{ width: "200px" }} src={collection.img} alt={collection.name} />
//                 <p>{collection.name}</p>
//                 <p>{collection.description}</p>
//                 <p>{collection.tags}</p>
//                 <p>{collection.status}</p>
//                 <p>{collection.views.length} Views</p>
//                 <button
//                     onClick={() => {
//                     view(collection.id);
//                     navigate(`/gallery/${collection.id}`);
//                     }}
//                 >
//                     View
//                 </button>
//                 </li>
//             ))}
//             </ul>
//             {collectionHasMore && !collectionLoading && (
//             <button onClick={() => setCollectionPage(prev => prev + 1)}>Show More Collections</button>
//             )}
//         </div>
//     </div>
//   );
// }


// function GenreSelector({ storyFilters, setStoryFilters }) {
//   const [selectedGenres, setSelectedGenres] = useState([]);
//   const [subGenres, setSubGenres] = useState({}); // { genre: [subgenres] }

//   // Handle genre selection
//   const handleGenreChange = (e) => {
//     const value = e.target.value;

//     // Add or remove genre
//     setSelectedGenres((prev) => {
//       if (prev.includes(value)) return prev.filter((g) => g !== value);
//       if (prev.length < 3) return [...prev, value];
//       return prev; // max 3
//     });

//     // Update subgenre options for that genre
//     setSubGenres((prev) => ({ ...prev, [value]: genreOptions[value] || [] }));
//   };

//   // Handle subgenre selection
//   const handleSubgenreChange = (genre, e) => {
//     const options = Array.from(e.target.selectedOptions, (opt) => opt.value);
//     setStoryFilters((prev) => ({
//       ...prev,
//       primarysubgenre: genre === selectedGenres[0] ? options : prev.primarysubgenre,
//       secondarysubgenre: genre === selectedGenres[1] ? options : prev.secondarysubgenre,
//       tertiarysubgenre: genre === selectedGenres[2] ? options : prev.tertiarysubgenre,
//     }));
//   };

//   return (
//     <div className="genre-selector">
//       <div>
//         <label>Pick up to 3 Genres:</label>
//         <select multiple value={selectedGenres} onChange={handleGenreChange}>
//           {Object.keys(genreOptions).map((genre) => (
//             <option key={genre} value={genre}>
//               {genre}
//             </option>
//           ))}
//         </select>
//       </div>

//       {selectedGenres.map((genre, idx) => (
//         <div key={genre}>
//           <label>Select Subgenres for {genre}:</label>
//           <select
//             multiple
//             value={storyFilters[idx === 0 ? "primarysubgenre" : idx === 1 ? "secondarysubgenre" : "tertiarysubgenre"] || []}
//             onChange={(e) => handleSubgenreChange(genre, e)}
//           >
//             {(subGenres[genre] || []).map((sub) => (
//               <option key={sub} value={sub}>
//                 {sub}
//               </option>
//             ))}
//           </select>
//         </div>
//       ))}
//     </div>
//   );
// }
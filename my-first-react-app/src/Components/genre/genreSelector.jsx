import { useState, useEffect } from "react";
import genreOptions from "./genre";

function GenreSelector({ setStoryFilters }) {

    const [genres, setGenres] = useState([
      { genre: "Romance", subgenres: [] },
      { genre: "Mystery", subgenres: [] },
    ]);
  
    // Initialize default subgenres
    useEffect(() => {
      setGenres((prev) =>
        prev.map((g) => ({
          ...g,
          subgenres: genreOptions[g.genre] || [],
        }))
      );
    }, []);
  
    // Handle genre change
    const handleGenreChange = (index, newGenre) => {
      const updatedGenres = [...genres];
      updatedGenres[index] = {
        genre: newGenre,
        subgenres: genreOptions[newGenre] || [],
      };
      setGenres(updatedGenres);
  
      // Update story filters
      const keys = ["primarygenre", "secondarygenre"];
      setStoryFilters((prev) => ({
        ...prev,
        [keys[index]]: newGenre,
      }));
    };
  
    // Handle subgenre change
    const handleSubgenreChange = (index, e) => {
      const selectedSub = e.target.value;
      const keys = ["primarysubgenre", "secondarysubgenre"];
  
      setStoryFilters((prev) => ({
        ...prev,
        [keys[index]]: selectedSub,
      }));
    };
  
    return (
      <div className="genre-selector">
        <div className="genre-selector">
          {genres.map((item, index) => (
            <div key={index} style={{ marginBottom: "1rem" }}>
              {/* Genre Dropdown */}
              <select
                value={item.genre}
                onChange={(e) => handleGenreChange(index, e.target.value)}
              >
                {Object.keys(genreOptions).map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
    
              {/* Subgenre Dropdown */}
              <select onChange={(e) => handleSubgenreChange(index, e)}>
                {item.subgenres.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <select onChange={(e) => setStoryFilters(f => ({ ...f, audience: e.target.value }))}>
            <option value="">Select Audience</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="genral">General</option>
        </select>

        <select onChange={(e) => setStoryFilters(f => ({ ...f, age: e.target.value }))}>
            <option value="">Select Age Group</option>
            <option value="kids">Kids</option>
            <option value="teen">Teen</option>
            <option value="young adult">Young Adult</option>
            <option value="adult">Adult</option>
        </select>

        <select onChange={(e) => setStoryFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
        </select>

        <select onChange={(e) => setStoryFilters(f => ({ ...f, sort: e.target.value }))}>
            <option value="popular">Most Popular</option>   
            <option value="recent">Recently Updated</option>  
        </select>
      </div>
    );
  }
  
  
  export default GenreSelector;
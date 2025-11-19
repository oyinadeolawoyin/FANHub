import { useState, useEffect } from "react";
import genreOptions from "./genre";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BookOpen, Tag, Users, Calendar, TrendingUp, Filter } from "lucide-react";

function GenreSelector({ storyFilters, setStoryFilters }) {
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
  const handleSubgenreChange = (index, selectedSub) => {
    const keys = ["primarysubgenre", "secondarysubgenre"];

    setStoryFilters((prev) => ({
      ...prev,
      [keys[index]]: selectedSub,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: "var(--border-color)" }}>
        <Filter className="w-5 h-5" style={{ color: "var(--accent-color)" }} aria-hidden="true" />
        <h3 className="text-lg font-semibold">Filter Stories</h3>
      </div>

      {/* Genre & Subgenre Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4" style={{ color: "var(--accent-color)" }} aria-hidden="true" />
          <span className="text-sm font-semibold" style={{ color: "var(--secondary-text)" }}>
            Genres & Subgenres
          </span>
        </div>

        {genres.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-xl space-y-3 transition-all"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--border-color)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-3.5 h-3.5" style={{ color: index === 0 ? "#3b82f6" : "#8b5cf6" }} aria-hidden="true" />
              <span className="text-xs font-medium" style={{ color: "var(--secondary-text)" }}>
                {index === 0 ? "Primary Genre" : "Secondary Genre"}
              </span>
            </div>

            {/* Genre Select */}
            <div className="space-y-2">
              <Label htmlFor={`genre-${index}`} className="text-sm font-medium" style={{ color: "var(--foreground-color)" }}>
                Genre
              </Label>
              <Select
                value={item.genre}
                onValueChange={(value) => handleGenreChange(index, value)}
              >
                <SelectTrigger
                  id={`genre-${index}`}
                  className="themed-select-trigger"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    color: "var(--input-text)",
                    borderColor: "var(--border-color)"
                  }}
                  aria-label={`Select ${index === 0 ? 'primary' : 'secondary'} genre`}
                >
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent className="themed-select-content" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
                  {Object.keys(genreOptions).map((genre) => (
                    <SelectItem
                      key={genre}
                      value={genre}
                      className="themed-select-item"
                      style={{ color: "var(--foreground-color)" }}
                    >
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subgenre Select */}
            <div className="space-y-2">
              <Label htmlFor={`subgenre-${index}`} className="text-sm font-medium" style={{ color: "var(--foreground-color)" }}>
                Subgenre
              </Label>
              <Select onValueChange={(value) => handleSubgenreChange(index, value)}>
                <SelectTrigger
                  id={`subgenre-${index}`}
                  className="themed-select-trigger"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    color: "var(--input-text)",
                    borderColor: "var(--border-color)"
                  }}
                  aria-label={`Select ${index === 0 ? 'primary' : 'secondary'} subgenre`}
                >
                  <SelectValue placeholder="Select a subgenre" />
                </SelectTrigger>
                <SelectContent className="themed-select-content" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
                  {item.subgenres.map((sub) => (
                    <SelectItem
                      key={sub}
                      value={sub}
                      className="themed-select-item"
                      style={{ color: "var(--foreground-color)" }}
                    >
                      {sub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      {/* Audience Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4" style={{ color: "var(--accent-color)" }} aria-hidden="true" />
          <span className="text-sm font-semibold" style={{ color: "var(--secondary-text)" }}>
            Audience & Demographics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Audience */}
          <div className="space-y-2">
            <Label htmlFor="audience-select" className="text-sm font-medium" style={{ color: "var(--foreground-color)" }}>
              Target Audience
            </Label>
            <Select
              value={storyFilters.audience}
              onValueChange={(value) => setStoryFilters(f => ({ ...f, audience: value }))}
            >
              <SelectTrigger 
                id="audience-select" 
                className="themed-select-trigger"
                style={{
                  backgroundColor: "var(--input-bg)",
                  color: "var(--input-text)",
                  borderColor: "var(--border-color)"
                }}
              >
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent className="themed-select-content" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
                <SelectItem value="general" className="themed-select-item" style={{ color: "var(--foreground-color)" }}>
                  General
                </SelectItem>
                <SelectItem value="male" className="themed-select-item" style={{ color: "var(--foreground-color)" }}>
                  Male
                </SelectItem>
                <SelectItem value="female" className="themed-select-item" style={{ color: "var(--foreground-color)" }}>
                  Female
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Age Group */}
          <div className="space-y-2">
            <Label htmlFor="age-select" className="text-sm font-medium" style={{ color: "var(--foreground-color)" }}>
              Age Group
            </Label>
            <Select
              value={storyFilters.age}
              onValueChange={(value) => setStoryFilters(f => ({ ...f, age: value }))}
            >
              <SelectTrigger 
                id="age-select" 
                className="themed-select-trigger"
                style={{
                  backgroundColor: "var(--input-bg)",
                  color: "var(--input-text)",
                  borderColor: "var(--border-color)"
                }}
              >
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
              <SelectContent className="themed-select-content" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
                <SelectItem value="kids" className="themed-select-item" style={{ color: "var(--foreground-color)" }}>
                  Kids (6-12)
                </SelectItem>
                <SelectItem value="teen" className="themed-select-item" style={{ color: "var(--foreground-color)" }}>
                  Teen (13-17)
                </SelectItem>
                <SelectItem value="young adult" className="themed-select-item" style={{ color: "var(--foreground-color)" }}>
                  Young Adult (18-25)
                </SelectItem>
                <SelectItem value="adult" className="themed-select-item" style={{ color: "var(--foreground-color)" }}>
                  Adult (26+)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Story Status & Sort Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4" style={{ color: "var(--accent-color)" }} aria-hidden="true" />
          <span className="text-sm font-semibold" style={{ color: "var(--secondary-text)" }}>
            Status & Sorting
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status-select" className="text-sm font-medium" style={{ color: "var(--foreground-color)" }}>
              Story Status
            </Label>
            <Select
              value={storyFilters.status}
              onValueChange={(value) => setStoryFilters(f => ({ ...f, status: value }))}
            >
              <SelectTrigger 
                id="status-select" 
                className="themed-select-trigger"
                style={{
                  backgroundColor: "var(--input-bg)",
                  color: "var(--input-text)",
                  borderColor: "var(--border-color)"
                }}
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="themed-select-content" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
                <SelectItem value="ongoing" className="themed-select-item" style={{ color: "var(--foreground-color)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Ongoing
                  </div>
                </SelectItem>
                <SelectItem value="completed" className="themed-select-item" style={{ color: "var(--foreground-color)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Completed
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <Label htmlFor="sort-select" className="text-sm font-medium" style={{ color: "var(--foreground-color)" }}>
              Sort By
            </Label>
            <Select
              value={storyFilters.sort}
              onValueChange={(value) => setStoryFilters(f => ({ ...f, sort: value }))}
            >
              <SelectTrigger 
                id="sort-select" 
                className="themed-select-trigger"
                style={{
                  backgroundColor: "var(--input-bg)",
                  color: "var(--input-text)",
                  borderColor: "var(--border-color)"
                }}
              >
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="themed-select-content" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
                <SelectItem value="recent" className="themed-select-item" style={{ color: "var(--foreground-color)" }}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Recently Updated
                  </div>
                </SelectItem>
                <SelectItem value="popular" className="themed-select-item" style={{ color: "var(--foreground-color)" }}>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Most Popular
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Reset Filters Button */}
      <div className="pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
        <button
          onClick={() => {
            setStoryFilters({
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
            setGenres([
              { genre: "Romance", subgenres: genreOptions["Romance"] || [] },
              { genre: "Mystery", subgenres: genreOptions["Mystery"] || [] },
            ]);
          }}
          className="w-full py-2.5 px-4 rounded-lg font-medium transition-all hover:opacity-90"
          style={{
            backgroundColor: "var(--button-bg)",
            color: "var(--button-text)",
            border: "1px solid var(--border-color)"
          }}
          aria-label="Reset all filters"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}

export default GenreSelector;
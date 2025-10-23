import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import genreOptions from "../genre/genre";
import { warnings } from "../genre/warning";
import Select from "react-select";

function Updatestory() {
    const [form, setForm] = useState({
        title: "",
        file: null,
        summary: "",
        primarygenre: "",
        primarysubgenre: [],
        secondarygenre: "",
        secondarysubgenre: [],
        audience: "",
        type: "",
        age: "",
        status: "ongoing",
        warnings: [],
    });

    const { id } = useParams();
    const { user } = useAuth();
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [storyLoading, setStoryLoading] = useState(false);
    const [story, setStory] = useState(null);

    useEffect(() => {
      if (story) {
        setForm({
          title: story.story.title || "",
          file: story.story.imgUrl || "",
          summary: story.story.summary || "",
          status: story.story.status || "",
          type: story.story.type || "",
          primarygenre: story.story.primarygenre || "",
          primarysubgenre: story.story.primarysubgenre || [],
          secondarygenre: story.story.secondarygenre || "",
          secondarysubgenre: story.story.secondarysubgenre || [],
          audience: story.story.audience || "",
          age: story.story.age || "",
          warnings: story.story.warnings || [],
        });
      }
    }, [story]); //re-runs when chapter changes

    useEffect(() => {
      async function fetchStory() {
        setError("");
        setStoryLoading(true);
        try {
          const response = await fetch(`https://fanhub-server.onrender.com/api/stories/story/${id}`, {
              method: "GET",
              credentials: "include",
          });
  
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
  
          setStory(data.story); 
        
        } catch(err) {
            navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
            setStoryLoading(false);
        }
      };
  
      fetchStory();
    }, [id]);

    const handleChange = (e) => {
      if (!e || !e.target) return; // Prevent errors from undefined events
    
      const { name, value, type, files, checked } = e.target;
    
      setForm((prev) => {
        // File input
        if (type === "file") {
          return { ...prev, [name]: files[0] };
        }
    
        // Checkbox input (if used in the future)
        if (type === "checkbox") {
          return { ...prev, [name]: checked };
        }
    
        // Regular text, textarea, and select inputs
        return { ...prev, [name]: value };
      });
    };    
    

    async  function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("summary", form.summary);
        formData.append("status", form.status);
        formData.append("file", form.file); 
        formData.append("type", form.type); 
        formData.append("primarygenre", form.primarygenre);
        formData.append("primarysubgenre", JSON.stringify(form.primarysubgenre));
        formData.append("secondarygenre", form.secondarygenre);
        formData.append("secondarysubgenre", JSON.stringify(form.secondarysubgenre));
        formData.append("audience", form.audience);
        formData.append("age", form.age);
        formData.append("warnings", JSON.stringify(form.warnings));
    
        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}`, {
                method: "POST",
                body: formData,
                credentials: "include",
            });
    
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
    
            alert("Updated!");  
    
            navigate(`/dashboard/stories/${user.id}`); 
        } catch(err) {
            navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
            setLoading(false);
        }
    };
    
    
    return (
        <div>
           <h2>Update Your Story</h2>
          {storyLoading && <p>Loading, please wait...</p>}
          {story && (
            <form onSubmit={handleSubmit}>
            <label>
              Title:{" "}
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Upload image:{" "}
              <input
                type="file"
                name="file"
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Summary:{" "}
              <textarea
                name="summary"
                value={form.summary}
                onChange={handleChange}
                required
                placeholder="Write here..."
              />
            </label>
            <label>
              Type:{" "}
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="novel">Novel</option>
                <option value="short story">Short Story</option>
                <option value="flash story">Flash story</option>
                <option value="poem">Poem</option>
              </select>
            </label>
            <GenreSelect
              genre="primarygenre"
              subgenre="primarysubgenre"
              form={form}
              setForm={setForm}
              handleChange={handleChange}
            />

            <GenreSelect
              genre="secondarygenre"
              subgenre="secondarysubgenre"
              form={form}
              setForm={setForm}
              handleChange={handleChange}
            />
            <label>
              Audience:{" "}
              <select
                name="audience"
                value={form.audience}
                onChange={handleChange}
                required
              >
                <option value="">Select Audience</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="general">General</option>
              </select>
            </label>
            <label>
              Story Age Group:{" "}
              <select
                name="age"
                value={form.age}
                onChange={handleChange}
                required
              >
                <option value="">Select Age Group</option>
                <option value="kids">Kids</option>
                <option value="teen">Teen</option>
                <option value="young adult">Young Adult</option>
                <option value="adult">Adult</option>
              </select>
            </label>
            <label>
              Story status:{" "}
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
              >
                <option value="">Select Status</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label>
              Warnings:
              <Select
                isMulti
                name="warnings"
                options={warnings.map((warn) => ({
                  value: warn,
                  label: warn,
                }))}
                value={form.warnings.map((w) => ({ value: w, label: w }))}
                onChange={(selected) => {
                  if (selected.length > 4) return; // limit to 4 warnings
                  setForm((prev) => ({
                    ...prev,
                    warnings: selected.map((s) => s.value),
                  }));
                }}
                placeholder="Select one or more warnings (max 4)"
                className="basic-multi-select"
                classNamePrefix="select"
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Update"}
            </button>
          </form>
          )}
         
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}      

function GenreSelect({ genre, subgenre, form, setForm, handleChange }) {
  return (
    <div>
      <label>
        Genre:{" "}
        <select
          name={genre}
          value={form[genre]}
          onChange={handleChange}
        >
          <option value="">Select Genre</option>
          {Object.keys(genreOptions).map((g) => (
            <option key={g} value={g}>
              {g.replace(/([A-Z])/g, " $1").trim()}
            </option>
          ))}
        </select>
      </label>

      <label>
        Subgenre:
        <Select
          isMulti
          name={subgenre}
          options={
            form[genre]
              ? genreOptions[form[genre]].map((sub) => ({
                  value: sub,
                  label: sub,
                }))
              : []
          }
          value={form[subgenre].map((s) => ({ value: s, label: s }))}
          onChange={(selected) => {
            if (selected.length > 4) return; // Limit selection to 4
            setForm((prev) => ({
              ...prev,
              [subgenre]: selected.map((item) => item.value),
            }));
          }}
          isDisabled={!form[genre]}
          placeholder={
            form[genre] ? "Select up to 4 Subgenres" : "Select a Genre first"
          }
          className="basic-multi-select"
          classNamePrefix="select"
        />
      </label>
    </div>
  );
}

export default Updatestory;
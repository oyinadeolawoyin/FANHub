import { useState } from "react";
// import { usePosts } from "./postContext";

function CreatePost({ onPostCreated }) {
    const [form, setForm] = useState({
        title: "",
        content: "",
        file: "",
    });
    console.log("Uploading file:", form.file); 
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    // const { posts, setPosts } = usePosts();

    const handleChange = (e) => {
      const { name, value, files } = e.target;
      if (name === "file") {
        setForm({ ...form, [name]: files[0] });
      } else {
        setForm({ ...form, [name]: value });
      }
    };   
    
    async function handleSubmit (e) {
        e.preventDefault();
        setError("");
        setLoading(true);


        const formData = new FormData();
        formData.append("title", form.title);
        formData.append("content", form.content); 
        formData.append("file", form.file); 
    
        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/posts/create-post`, {
              method: "POST",
              body: formData,
              credentials: "include",
            });
          
            const data = await response.json();
           
            if (!response.ok) {
                console.log("postError", data.error);
                setError(data.message || "Something is wrong. Try again!");
                setLoading(false);
                return;
            }
            
            // setPosts(data.posts); 
            // console.log("posts", posts);
            alert("created!")
            
            // 👇 Call back up to ProfilePosts to update UI immediately
            if (onPostCreated) {
              onPostCreated(data.posts);
            }
            
        } catch(err) {
            alert("Something went wrong. Please try again.");
        } finally {
          setLoading(false);
        }
    };
    
    
    return (
        <div>
          <h2>Create Post</h2>
      
          {loading && <div>Loading, please wait...</div>}
          {error && <p style={{ color: "red" }}>{error}</p>}
      
          {!loading && (
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
                Content:{" "}
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  required
                  placeholder="Write here..."
                />
              </label>

              <label>
                Upload image:{" "}
                <input
                  type="file"
                  name="file"
                  accept="image/*"
                  onChange={handleChange}
                />
              </label>
              <button type="submit">Create</button>
            </form>
          )}
        </div>
    );
}      

export default CreatePost;
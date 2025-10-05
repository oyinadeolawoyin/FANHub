import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";

function CreateReview() {
    const [form, setForm] = useState({
        title: "",
        content: "",
        overallrate: "",
        grammarrate: "",
        plotrate: "",
        writingstylerate: ""
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const { user } = useAuth();

    // console.log("authUser", user);
    
    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prevForm => ({
          ...prevForm,
          [name]: value
        }));
    }    

    async function handleSubmit(e) {
      e.preventDefault();
      setError("");
      setLoading(true);
    
      try {
        const response = await fetch(`https://fanhub-server.onrender.com/api/stories/${id}/createreview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
          credentials: "include",
        });
    
        const data = await response.json();
    
        if (!response.ok) {
          setError(data.message || "Something is wrong. Try again!");
          setLoading(false);
          return;
        }
        
        const socialResponse = await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/social/reviewpoint`, {
            method: "POST",
            credentials: "include",
        });
       
        if (!socialResponse.ok) {
            setError(socialData.message || "Something is wrong. Try again!");
            return;
        }  
        
        const socialData = await socialResponse.json();
        
        console.log("sociallll", socialData.message);
        alert( "Review created!");
        navigate(`/story/${id}`);
      } catch (err) {
        console.error(err);
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }    
    
    return (
        <div>
          <h2>Write Review</h2>
      
          {loading && <div>Loading, please wait...</div>}
          {error && <p style={{ color: "red" }}>{error}</p>}
      
          {!loading && (
            <form>
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
                Overall Rate:{" "}
                <input
                  type="number"
                  name="overallrate"
                  value={form.overallrate}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Plot Rate:{" "}
                <input
                  type="number"
                  name="plotrate"
                  value={form.plotrate}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Grammar Rate:{" "}
                <input
                  type="number"
                  name="grammarrate"
                  value={form.grammarrate}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Writing Style Rate:{" "}
                <input
                  type="number"
                  name="writingstylerate"
                  value={form.writingstylerate}
                  onChange={handleChange}
                  required
                />
              </label>
              <button onClick={handleSubmit}>Post</button>
            </form>
          )}
        </div>
    );
}      

export default CreateReview;
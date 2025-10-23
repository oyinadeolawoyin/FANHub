import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";

function WriteReview() {
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
    const { id, name } = useParams();
    const { user } = useAuth();
    
    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prevForm => ({
          ...prevForm,
          [name]: value
        }));
    }   
    
    async function handleSubmit(e) {
        setLoading(true);
        setError("");
        e.preventDefault();

        try {
            const path = name === "stories"
                  ? `https://fanhub-server.onrender.com/api/stories/${id}/createreview`
                  : `https://fanhub-server.onrender.com/api/gallery/collections/${id}/writeReview`;

            const response = await fetch(path, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form),
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

            const socialResponse = await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/social/reviewpoint`, {
              method: "POST",
              credentials: "include",
            });
          
            if (!socialResponse.ok) {
              const errData = await socialResponse.json();
                setError(errData.message || "Something is wrong. Try again!");
                return;
            }  
            alert( "Review created!");
            if (name == "stories") {
                navigate(`/stories/${id}`);
            } else {
                navigate(`/gallery/${id}`);
            }
        } catch (err) {
          navigate("/error", {
            state: { message: "Network error: Please check your internet connection." },
          });
        } finally {
          setLoading(false);
        }
    }  
    
    return (
      <div>
        <h2>Write Review</h2>
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
            Overall Rate:{" "}
            <input
              type="number"
              name="overallrate"
              value={form.overallrate}
              onChange={handleChange}
              required
            />
          </label>

          {name === "stories" && (
            <div>
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
            </div>
          )}

          <button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Post"}
          </button>
        </form>    
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
}      

export default WriteReview;
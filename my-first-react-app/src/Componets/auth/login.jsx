import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./authContext";

function Login() {
    const [form, setForm] = useState({
        username: "",
        password: "",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prevForm => ({
          ...prevForm,
          [name]: value
        }));
    }    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
    
        try {
            const response = await fetch("https://fanhub-server.onrender.com/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
                credentials: "include",
            });
    
            if (!response.ok) {
                setError(data.message || "Login failed");
                return;
            } else if (response.ok) {
                const data = await response.json();
                setUser(data);
                navigate("/");
            } 
            
        } catch(err) {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };
    
    if (loading) {
        return <div>Loading, please wait...</div>;
    }
    
    return (
        <div>
            <h2>Log In</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Username:{" "}
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      required 
                    />
                </label>
                <label>
                    Password:{" "}
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required 
                    />
                </label>
                <button type="submit">Log In</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default Login;
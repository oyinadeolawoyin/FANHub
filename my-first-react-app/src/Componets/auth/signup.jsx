import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./authContext";

function Signup() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        country: "",
        gender: "",
        newsletter: false,
        role: "USER"
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm(prevForm => ({
          ...prevForm,
          [name]: type === "checkbox" ? checked : value
        }));
    };
      

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        console.log(form);

        try {
            const response = await fetch("https://fanhub-server.onrender.com/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
                credentials: "include",
                
            });

            if (!response.ok) {
                setError(data.message || "Signup failed");
                return;
            } else if (response.ok) {
                const data = await response.json();
                setUser(data);
                navigate("/login");
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
            <h2>Sign Up</h2>
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
                    Email:{" "}
                    <input
                      type="email"
                      name="email"
                      value={form.email}
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
                <label>
                    Country:{" "}
                    <input
                      type="text"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      required 
                    />
                </label>
                <label>
                    gender:{" "}
                    <input
                      type="text"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      required 
                    />
                </label>
                <label>
                    Enter your Role:{" "}
                    <input
                      type="text"
                      name="role"
                      placeholder="Enter ADMIN/USER/SPONSOR"
                      value={form.role}
                      onChange={handleChange}
                      required 
                    />
                </label>
                <label>
                    Accept Newsletter:{" "}
                    <input
                        type="checkbox"
                        name="newsletter"
                        checked={form.newsletter}
                        onChange={handleChange}
                    />
                </label>
                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Sign Up"}
                </button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default Signup;
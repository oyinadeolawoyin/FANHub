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
        bio:"",
        file: "",
        role: "USER"
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "file") {
          setForm({ ...form, [name]: files[0] });
        } else {
          setForm({ ...form, [name]: value });
        }
    }; 
      

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const formData = new FormData();
        formData.append("username", form.username);
        formData.append("email", form.email);
        formData.append("password", form.password);
        formData.append("country", form.country);
        formData.append("gender", form.gender); 
        formData.append("bio", form.bio); 
        formData.append("file", form.file); 

        try {
            const response = await fetch("https://fanhub-server.onrender.com/api/auth/signup", {
                method: "POST",
                body: formData,
                credentials: "include",
            });
            
            if (!response.ok) {
                setError(data.message || "Signup failed");
                return;
            } else if (response.ok) {
                const data = await response.json();
                console.log("data", data);
                setUser(data.user);
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
                    bio:{" "}
                    <input
                        type="text"
                        name="bio"
                        checked={form.bio}
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
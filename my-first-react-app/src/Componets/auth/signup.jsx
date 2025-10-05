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
    });

    const [singupError, setSignupError] = useState("");
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [signupLoading, setSignupLoading] = useState(false);

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
        setSignupError("");
        setSignupLoading(true);

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

            const data = await response.json();
            
            if (response.status === 500) {
                navigate("/error", { state: { message: data.message || "Signup failed" } });
                return;
            } else {
                if (!response.ok && response.status !== 500) {
                    setSignupError(data.message); 
                    return;
                }
            } 

            setUser(data.user);
            navigate("/login");
        } catch(err) {
            navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
            setSignupLoading(false);
        }
    };

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
                    bio:{" "}
                    <input
                        type="text"
                        name="bio"
                        checked={form.bio}
                        onChange={handleChange}
                    />
                </label>
                <button type="submit" disabled={signupLoading}>
                    {signupLoading ? "loading..." : "Sign Up"}
                </button>
            </form>
            {singupError && <p style={{ color: "red" }}>{singupError}</p>}
        </div>
    );
}

export default Signup;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./authContext";

function Login() {
    const [form, setForm] = useState({
        username: "",
        password: "",
    });
    const [loginError, setLoginError] = useState("");
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [loginLoading, setLoginLoading] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm(prevForm => ({
          ...prevForm,
          [name]: value
        }));
    }    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError("");
        setLoginLoading(true);
    
        try {
            const response = await fetch("https://fanhub-server.onrender.com/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
                credentials: "include",
            });
    
            const data = await response.json();

            if (response.status === 500) {
                navigate("/error", { state: { message: data.message || "Login failed" } });
                return;
            } else {
                if (!response.ok && response.status !== 500) {
                    setLoginError(data.message); 
                    return;
                }
            } 
           
            setUser(data.user);
            navigate("/");  
        } catch(err) {
            navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
            setLoginLoading(false);
        }
    };
    
    
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
                <button type="submit" disabled={loginLoading}>
                    {loginLoading ? "Loading..." : "Log In"}
                </button>
            </form>
            <button type="button" onClick={() => navigate(`/forget-password`)}>Forget Password</button>
            <p>Already have an account, go to <span onClick={() => navigate(`/signup`)}>sign up page</span></p>
            {loginError && <p style={{ color: "red" }}>{loginError}</p>}
        </div>
    );
}

export default Login;
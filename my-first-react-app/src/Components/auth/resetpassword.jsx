import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Resetpassword() {
    const [form, setForm] = useState({
        password: "",
    });
    const location = useLocation(); // to get query params
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // extract token from URL
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

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
            const response = await fetch("https://fanhub-server.onrender.com/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,              // include the token
                    newPassword: form.password, // include new password
                }),
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
            alert(data.message);
            navigate("/");
            
        } catch(err) {
            navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div>
            <h2>Enter new password</h2>
            <form onSubmit={handleSubmit}>
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
                <button type="submit" disabled={loading}>
                    {loading ? "Loading..." : "Submit"}
                </button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default Resetpassword;
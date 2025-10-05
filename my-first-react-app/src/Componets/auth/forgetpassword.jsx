import { useState } from "react";

function Forgetpassword() {
    const [form, setForm] = useState({
        email: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

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
            const response = await fetch(
                "https://fanhub-server.onrender.com/api/auth/forget-password",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                    credentials: "include",
                }
            );
    
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
    
            setMessage(data.message);
        } catch(err) {
            navigate("/error", { state: { message:  "Network error: Please check your internet connection." } });
        } finally {
            setLoading(false);
        }
    }    
    
    return (
        <div>
            {!message && 
                <div>
                    <h2>Enter Email</h2>
                    <form onSubmit={handleSubmit}>
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
                        <button type="submit" disabled={loading}>
                            {loading ? "Loading..." : "Submit"}
                        </button>
                    </form>
                </div>
            }
            {message && <p>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default Forgetpassword;
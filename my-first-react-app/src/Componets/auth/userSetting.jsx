import { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "./authContext";
import { useUser } from "../profile/usersContext";

function Usersettings() {
    const { user, setUser } = useUser();
    console.log("user", user);
    const [form, setForm] = useState({
        username: user?.username,
        country: user?.country,
        gender: user?.gender,
        bio:user?.bio,
        instagram:user?.instagram,
        facebook:user?.facebook,
        twitter:user?.twitter,
        discord:user?.discord,
        donation:user?.donation,
        file: "",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    // const { setUser } = useAuth();
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
        formData.append("country", form.country);
        formData.append("gender", form.gender); 
        formData.append("bio", form.bio); 
        formData.append("file", form.file); 
        formData.append("instagram", form.instagram); 
        formData.append("facebook", form.facebook); 
        formData.append("twitter", form.twitter); 
        formData.append("discord", form.discord); 
        formData.append("donation", form.donation); 

        try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/users/${user.id}/update`, {
                method: "POST",
                body: formData,
                credentials: "include",
            });
            
            if (!response.ok) {
                setError(data.message || "Update failed");
                return;
            } else if (response.ok) {
                const data = await response.json();
                console.log("data", data);
                setUser(data.user);
                localStorage.removeItem("user"); 
                localStorage.setItem("user", JSON.stringify(data.user));
                navigate(`/profile/${user.username}/${user.id}/about`);
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
            <h2>Update your profile</h2>
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
                <label>
                    Upload cover picture:{" "}
                    <input
                    type="file"
                    name="file"
                    onChange={handleChange}
                    />
                </label>
                <label>
                    Instagram:{" "}
                    <input
                        type="text"
                        name="instagram"
                        checked={form.instagram}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Facebook:{" "}
                    <input
                        type="text"
                        name="facebook"
                        checked={form.facebook}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Twitter:{" "}
                    <input
                        type="text"
                        name="twitter"
                        checked={form.twitter}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Discord:{" "}
                    <input
                        type="text"
                        name="discord"
                        checked={form.discord}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Donation:{" "}
                    <input
                        type="text"
                        name="donation"
                        checked={form.donation}
                        onChange={handleChange}
                    />
                </label>
                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Save"}
                </button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default Usersettings;
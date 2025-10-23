import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function About() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`https://fanhub-server.onrender.com/api/users/${id}`, {
          method: "GET",
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

        setUser(data.user);
      } catch (err) {
        navigate("/error", {
          state: { message: "Network error: Please check your internet connection." },
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [id, navigate]);

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading ? (
        <p>Loading... please wait!</p>
      ) : (
        user && (
          <main>
            <div>
              {user?.img && (
                <img src={user.img} alt="User" style={{ height: "100px", width: "100px" }} />
              )}
              <p>Bio: {user.bio}</p>
              <p>Instagram: {user.instagram || "No link yet"}</p>
              <p>Facebook: {user.facebook || "No link yet"}</p>
              <p>Twitter: {user.twitter || "No link yet"}</p>
              <p>Discord: {user.discord || "No link yet"}</p>
            </div>

            <div>
              <p>Gender: {user.gender}</p>
              <p>Country: {user.country}</p>
            </div>

            <div>
              <p><b>Social Point</b></p>
              <p>Comment Point: {user?.social?.[0]?.commentpoint ?? 0}</p>
              <p>Review Point: {user?.social?.[0]?.reviewpoint ?? 0}</p>
              <p>Like Point: {user?.social?.[0]?.likepoint ?? 0}</p>
              <p>Reading Point: {user?.social?.[0]?.readingpoint ?? 0}</p>
              <p>Writing Point: {user?.social?.[0]?.writingpoint ?? 0}</p>
            </div>

            <div>
              <p><b>Streak</b></p>
              <p>Writing Streak: {user?.writestreak ?? 0}</p>
              <p>Reading Streak: {user?.readstreak ?? 0}</p>
            </div>
          </main>
        )
      )}
    </div>
  );
}

export default About;
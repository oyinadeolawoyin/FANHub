import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Following() {
  const { id } = useParams();
  const [following, setFollowing] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError("");

  async function fetchUser() {
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
          
        } catch (err) {
          navigate("/error", {
            state: { message: "Network error: Please check your internet connection." },
          });
        } finally {
          setLoading(false);
        }
    }
    fetchUser();
  }, [id]);

  return (
    <div>
        {following ? (
            following.length > 0 ? (
                following.map((following) => (
                <div key={following.id}>
                  <ul onClick={() => navigate(`/profile/${following.following.followingusername}/${following.following.id}`)}>
                    <li>{following.following.username}</li>
                    <img 
                      style={{ width: "50px", height: "50px"}}
                      src={following.following.img} 
                      alt="" srcset="" />
                  </ul>
                </div>
                ))
            ) : (
                <p>No following yet</p>
            )
            ) : (
              <div>
                  {loading && <p>Loading.... please wait!</p>}
                  {error && <p style={{ color: "red" }}>{error}</p>}
              </div>
        )}
    </div>
  );
}

export default Following;
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Follower() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

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
          
          setFollowers(data.user.followers);
          console.log("follo", data.user.followers);
          
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
        {followers ? (
            followers.length > 0 ? (
                followers.map((follower) => (
                <div key={follower.id}>
                  <ul onClick={() => navigate(`/profile/${follower.followerusername}/${follower.followerId}`)}>
                    <li >{follower.followerusername}</li>
                  </ul>
                </div>
                ))
            ) : (
                <p>No follower yet</p>
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

export default Follower;
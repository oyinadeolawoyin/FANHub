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
          console.log("data", data.user);
  
          if (!response.ok) {
              setError(data.message || "Something is wrong. Try again!");
              return;
          }
          
          setFollowers(data.user.followers);
          
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    fetchUser();
  }, []);

  return (
    <div>
        {followers ? (
            followers.length > 0 ? (
                followers.map((follower) => (
                <div key={follower.id}>
                    <li onClick={() => navigate(`/profile/${follower.followerusername}/${follower.followerId}`)}>{follower.followerusername}</li>
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
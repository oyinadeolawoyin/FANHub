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
          console.log("data", data.user);
  
          if (!response.ok) {
              setError(data.message || "Something is wrong. Try again!");
              return;
          }
          
          setFollowing(data.user.followings);
          
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
        {following ? (
            following.length > 0 ? (
                following.map((following) => (
                <div key={following.id}>
                    <li onClick={() => navigate(`/profile/${following.followingusername}/${following.followingId}`)}>{following.followingusername}</li>
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
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../auth/authContext";

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id, username } = useParams();
  const [error, setError] = useState("");
  const [currectUser, setCurrentUser] = useState(null);
  const [followed, setFollowed] = useState("follow");
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    if (!currectUser || !user) return;
  
    const followers = currectUser.followers || [];
    const isFollowers = followers.some(f => Number(f.followerId) === Number(user.id));
    setFollowed(isFollowers ? "Unfollow" : "Follow");
  }, [currectUser, user]);  

  useEffect(() => {
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
          
          setCurrentUser(data.user);
          
        } catch (err) {
          navigate("/error", {
            state: { message: "Network error: Please check your internet connection." },
          });
        } 
    }
    fetchUser();
  }, [id]);

  async function follow(followerusername) {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`https://fanhub-server.onrender.com/api/users/follower/${followerusername}`, {
        method: "POST",
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

      const refreshed = await fetch(`https://fanhub-server.onrender.com/api/users/${id}`, {
        method: "GET",
        credentials: "include",
      });
      const refreshedData = await refreshed.json();

      if (refreshed.status === 500) {
        navigate("/error", { state: { message: refreshed.message || "Process failed" } });
        return;
      } else {
          if (!refreshed.ok && refreshed.status !== 500) {
              setError(refreshedData.message); 
              return;
          }
      } 

      setCurrentUser(refreshedData.user);

    } catch (err) {
      navigate("/error", {
        state: { message: "Network error: Please check your internet connection." },
      });
    } finally {
      setLoading(false);
    }
  }


  return (
    <>
      <div>
        {user && Number(user.id) == Number(id) ?(
            <header>
              <h1>Hello {username || "Guest"}, this is your profile!</h1>
              <p>Here is the profile page</p>
              <p>Return <Link to="/">Home</Link></p>
            </header>
        ):(
            <header>
              <h1>Hello {username || "Guest"}, this is your profile!</h1>
              <p>Here is the profile page</p>
              <p>Return <Link to="/">Home</Link></p>
              <button 
                type="submit" disabled={loading}
                 onClick={() => follow(username)}
              >
                {loading ? "Loading..." : `${followed}`}
              </button>
            </header>
        )}
        <main>
          <div>
            <li><Link to="about">About</Link></li>
            <li><Link to={`stories`}>Stories</Link></li>
            <li><Link to={`collections`}>Collections</Link></li>
            <li><Link to={`gallery`}>Gallery</Link></li>
            <li><Link to={`posts`}>Posts</Link></li>
            <li><Link to={`tweets`}>Tweets</Link></li>
            <li><Link to={`following`}>Following</Link></li>
            <li><Link to={`followers`}>Followers</Link></li>

            <div>
                <Outlet /> 
            </div>
          </div>
        </main>
      </div>
     {error && <p>{error}</p>}
     
    </>
  );
};

export default Profile;
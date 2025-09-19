import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../auth/authContext";

function Profile() {
  const { user } = useAuth();
  // const [user, setUser] = useState(null);
  const { id, username } = useParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currectUser, setCurrentUser] = useState(null);
  const [followed, setFollowed] = useState("follow");
  
  useEffect(() =>{
    if (user) {
      console.log("user", user, "id", id);
    }
  });

  useEffect(() => {
    if (!currectUser || !user) return;
  
    const followers = currectUser.followers || [];
    const isFollowers = followers.some(f => Number(f.followerId) === Number(user.id));
    setFollowed(isFollowers ? "Unfollow" : "Follow");
  }, [currectUser, user]);  

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
          console.log("mmmm", data);
          console.log("uuuuuuu", user);
  
          if (!response.ok) {
              setError(data.message || "Something is wrong. Try again!");
              return;
          }
          
          setCurrentUser(data.user);
          
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    fetchUser();
  }, []);

  async function follow(followerusername) {
    setError("");
    setLoading(true);
    console.log("id here", id);

    try {
      const response = await fetch(`https://fanhub-server.onrender.com/api/users/follower/${followerusername}`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();
      console.log("data", data);
      console.log("done!");
      
      if (!response.ok) {
          setError(data.message);
          return;
      }  

      const refreshed = await fetch(`https://fanhub-server.onrender.com/api/users/${id}`, {
        method: "GET",
        credentials: "include",
      });
      const refreshedData = await refreshed.json();
      setCurrentUser(refreshedData.user);

    } catch(err) {
        console.log("error", err);
        alert("Something went wrong. Please try again.");
    } 
    finally{
        setLoading(false);
    }
  }


  return (
    <>
     {loading && <p>Loading.....</p>}
     {error && <p>{error}</p>}
     {user && Number(user.id) == Number(id) ?(
      <div>
        <header>
          <h1>Hello {username || "Guest"}, this is your profile!</h1>
          <p>Here is the profile page</p>
          <p>Return <Link to="/">Home</Link></p>
        </header>

        <main>
          <div>
            <li><Link to="about">About</Link></li>
            <li><Link to={`stories`}>Stories</Link></li>
            <li><Link to={`collections`}>Collections</Link></li>
            <li><Link to={`gallery`}>Gallery</Link></li>
            <li><Link to={`posts`}>Posts</Link></li>
            <li><Link to={`following`}>Followings</Link></li>
            <li><Link to={`followers`}>Followers</Link></li>

            <div>
                <Outlet /> 
            </div>
          </div>
        </main>
      </div>
    ):(
      <div>
        <header>
          <h1>Hello {username || "Guest"}, this is your profile!</h1>
          <p>Here is the profile page</p>
          <p>Return <Link to="/">Home</Link></p>
          <button onClick={() => follow(username)}>{followed}</button>
        </header>

        <main>
          <div>
            <li><Link to="about">About</Link></li>
            <li><Link to={`stories`}>Stories</Link></li>
            <li><Link to={`collections`}>Collections</Link></li>
            <li><Link to={`gallery`}>Gallery</Link></li>
            <li><Link to={`posts`}>Posts</Link></li>
            <li><Link to={`following`}>Following</Link></li>
            <li><Link to={`followers`}>Followers</Link></li>

            <div>
                <Outlet /> 
            </div>
          </div>
        </main>
      </div>
    )}
    </>
  );
};

export default Profile;
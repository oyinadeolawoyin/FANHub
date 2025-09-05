import { useState } from "react";
import { useUser } from "./usersContext";
import { Outlet, Link } from "react-router-dom";

function Profile() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      
      if (!response.ok) {
          setError(data.message);
          return;
      } 
        
    } catch(err) {
        console.log("error", err);
        alert("Something went wrong. Please try again.");
    } 
    finally{
        setLoading(false);
    }
  }

  return (
    <div>
      <header>
        <h1>Hello {user?.username || "Guest"}, this is your profile!</h1>
        <p>Here is the profile page</p>
        <p>Return <Link to="/">Home</Link></p>
        {/* <button onClick={() => follow()}>Follow</button> */}
      </header>

      <main>
        {user && (
          <div>
            <li><Link to="about">About</Link></li>
            <li><Link to="stories">Stories</Link></li>
            <li><Link to="collections">Collections</Link></li>
            <li><Link to="gallery">Gallery</Link></li>
            <li><Link to="posts">Posts</Link></li>
            <li><Link to="following">Following</Link></li>
            <li><Link to="follower">Followers</Link></li>
  
            <div>
               <Outlet /> 
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
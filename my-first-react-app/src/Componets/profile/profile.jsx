import { use, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import { Outlet, Link } from "react-router-dom";

function Profile() {
  const { user } = useAuth();
  const { id } = useParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currectUser, setCurrentUser] = useState(null);
  
  useEffect(() =>{
    if (user) {
      console.log("user", user, "id", id);
    }
  });

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
          <h1>Hello {user.username || "Guest"}, this is your profile!</h1>
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
          <h1>Hello {currectUser?.username || "Guest"}, this is your profile!</h1>
          <p>Here is the profile page</p>
          <p>Return <Link to="/">Home</Link></p>
          <button onClick={() => follow(currectUser?.username)}>follow</button>
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
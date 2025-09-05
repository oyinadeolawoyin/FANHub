import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useUser } from "./usersContext";
import { Outlet, Link } from "react-router-dom";

function Profile() {
  const { user } = useUser();
  const { id } = useParams();
  // const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currectUser, setCurrentUser] = useState(null);
  
  useEffect(() =>{
    if (user) {
      console.log("user", user);
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
            <li><Link to={`stories/${user.id}`}>Stories</Link></li>
            <li><Link to={`collections/${user.id}`}>Collections</Link></li>
            <li><Link to={`gallery/${user.id}`}>Gallery</Link></li>
            <li><Link to={`posts/${user.id}`}>Posts</Link></li>
            <li><Link to={`followerings/${user.id}`}>Followings</Link></li>
            <li><Link to={`followers/${user.id}`}>Followers</Link></li>

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
          <button>follow</button>
        </header>

        <main>
          <div>
            <li><Link to="about">About</Link></li>
            <li><Link to={`stories/${currectUser?.id}`}>Stories</Link></li>
            <li><Link to={`collections/${currectUser?.id}`}>Collections</Link></li>
            <li><Link to={`gallery/${currectUser?.id}`}>Gallery</Link></li>
            <li><Link to={`posts/${currectUser?.id}`}>Posts</Link></li>
            <li><Link to={`followings/${currectUser?.id}`}>Following</Link></li>
            <li><Link to={`followers/${currectUser?.id}`}>Followers</Link></li>

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
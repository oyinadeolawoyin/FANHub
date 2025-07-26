import { useAuth } from "../auth/authContext";
import { Outlet, Link } from "react-router-dom";

function Dashboard() {
  const { user } = useAuth();
  return (
    <div>
      <header>
        <h1>Hello {user?.username || "Guest"}, this is your dashboard!</h1>
        <p>Here is the dashboard page</p>
        <p>Return <Link to="/">Home</Link></p>
      </header>

      <main>
        <div>
          <li><Link to="create story">Create Story</Link></li>
          <li><Link to="stories">Stories</Link></li>
          <li><Link to="create collection">Add new collection</Link></li>
          <li><Link to="collections">Collections</Link></li>
          <li><Link to="upload image">Upload image</Link></li>
          <li><Link to="upload video">Upload Video</Link></li>
          <li><Link to="images">Images</Link></li>
          <li><Link to="videos">Videos</Link></li>
          <li><Link to="share post">Share post</Link></li>
          <li><Link to="posts">Posts</Link></li>
          <div>
             <Outlet /> 
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
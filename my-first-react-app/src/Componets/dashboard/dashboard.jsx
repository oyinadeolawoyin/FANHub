import { useAuth } from "../auth/authContext";
import { Outlet, Link } from "react-router-dom";

function Dashboard() {
  const { user } = useAuth();
  return (
    <div>
      <header>
        <h1>Hello {user?.username || "Guest"}, this is your dashboard!</h1>
        <p>Here is the dashboard page</p>
      </header>

      <main>
        <div>
          <li><Link to="create story">Create Story</Link></li>
          <li><Link to="stories">Stories</Link></li>
          <li><Link to="upload images">Upload image</Link></li>
          <li><Link to="upload video">Upload Video</Link></li>
          <li><Link to="images">Images</Link></li>
          <li><Link to="videos">Videos</Link></li>
          <div>
             <Outlet /> 
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
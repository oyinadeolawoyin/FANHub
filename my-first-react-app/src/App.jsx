import { useAuth } from "./Componets/auth/authContext";
import { Outlet, Link } from "react-router-dom";

const App = () => {

  const { user } = useAuth();
  console.log('ajxs', user);
  return (
    <div>
      <header>
        <h1>Hello {user?.username || "Guest"}, from the main page of the app!</h1>
        <p>Here are some examples of links to other pages</p>
        <nav>
          <ul>
            <li><Link to="signup">Signup</Link></li>
            <li><Link to="login">Login</Link></li>
            <li><Link to="logout">Logout</Link></li>
          </ul>
        </nav>
      </header>

      <main>
        <div>
          <li><Link to="create story">Create Story</Link></li>
          <li><Link to="Stories">Stories</Link></li>
          <li><Link to="upload images">Upload image</Link></li>
          <li><Link to="upload video">Upload Video</Link></li>
          <li><Link to="images">Images</Link></li>
          <li><Link to="videos">Videos</Link></li>

          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default App;
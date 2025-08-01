import { useAuth } from "./Componets/auth/authContext";
import { Link } from "react-router-dom";

const App = () => {

  const { user } = useAuth();
  console.log('ajxs', user);
  return (
    <div>
      <header>
        <h1>Hello {user?.username || "Guest"}, Welcome to The Voices Community!</h1>
        <p>This is the homepage</p>
        <nav>
          <ul>
            <li><Link to="signup">Signup</Link></li>
            <li><Link to="login">Login</Link></li>
            <li><Link to="logout">Logout</Link></li>
            <li><Link to={`profile/${user?.username}`}>profile</Link></li>
            <li><Link to="dashboard">Dashboard</Link></li>
            <li><Link to="notification">reading list</Link></li>
            <li><Link to="setting">Setting</Link></li>
          </ul>
        </nav>
      </header>
    </div>
  );
};

export default App;
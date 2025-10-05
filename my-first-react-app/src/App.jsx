import { useAuth } from "./Componets/auth/authContext";
import { Link } from "react-router-dom";
import Homepage from "./Componets/homepage/homepage";

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
            <li><Link to={`profile/${user?.username}/${user?.id}`}>profile</Link></li>
            <li><Link to="dashboard">Dashboard</Link></li>
            <li><Link to={`library/${user?.id}`}>Library</Link></li>
            <li><Link to={`settings/${user?.id}`}>Setting</Link></li>
            <li><Link to={`notification/${user?.id}`}>Notification</Link></li>
          </ul>
        </nav>
      </header>

      <main>
        <Homepage />
      </main>
    </div>
  );
};

export default App;
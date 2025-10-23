import { useAuth } from "./Components/auth/authContext";
import { Link, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import NotificationsSetup from "./Components/notification/notificationSetup";
const App = () => {

  const { user } = useAuth();
  const navigate = useNavigate();
  console.log('ajxs', user);
  return (
    <div>
      {user && <NotificationsSetup user={user} />} 
      <header>
        <h1>Hello {user?.username || "Guest"}, Welcome to The Voices Community!</h1>
        <p>This is the homepage</p>
        <nav>
          <ul>
            <li><Link to="signup">Signup</Link></li>
            <li><Link to="login">Login</Link></li>
            <li><Link to="logout">Logout</Link></li>
            <li><Link to="tweets">Tweets</Link></li>
            <li onClick={() => navigate(`profile/${user?.username}/${user?.id}/about`)}>profile</li>
            <li><Link to="dashboard">Dashboard</Link></li>
            <li><Link to={`library/${user?.id}`}>Library</Link></li>
            <li><Link to={`settings/${user?.id}`}>Setting</Link></li>
            <li><Link to={`notification/${user?.id}`}>Notification</Link></li>
            <li><Link to={"create-tweet"}>Tweet</Link></li>
          </ul>
        </nav>
      </header>
      <ul>
        <li><Link to="homestories">Stories</Link></li>
        <li><Link to="homecollections">Collections</Link></li>    
      </ul>

      <main>
         <Outlet /> 
      </main>
      
    </div>
  );
};

export default App;
import { useUser } from "./usersContext";
import { Outlet, Link } from "react-router-dom";

function Profile() {
  const { user } = useUser();
  return (
    <div>
      <header>
        <h1>Hello {user?.username || "Guest"}, this is your profile!</h1>
        <p>Here is the profile page</p>
        <p>Return <Link to="/">Home</Link></p>
      </header>

      <main>
        <div>
          <li><Link to="about">About</Link></li>
          <li><Link to="stories">Stories {user?.stories?.length ?? 0}</Link></li>
          <li><Link to="collections">Collections {user?.collection?.length ?? 0}</Link></li>
          <li><Link to="gallery">Gallery {(user?.images?.length ?? 0) + (user?.videos?.length ?? 0)}</Link></li>
          <li><Link to="posts">Posts {user?.posts?.length ?? 0}</Link></li>
          <li><Link to="fans">Fans {user?.fans?.length ?? 0}</Link></li>
          
          <div>
             <Outlet /> 
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
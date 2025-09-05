import { useEffect, useState } from "react";
import { useUser } from "./usersContext";

function Follower() {
  const { user } = useUser();
  const [followers, setFollowers] = useState([]);

  useEffect(() => {
    if (user) {
      setFollowers(user.followers);
    }
  }, [user]);

  return (
    <div>
        {followers ? (
            followers.length > 0 ? (
                followers.map((follower) => (
                <div key={follower.id}>
                    <li>{follower.username}</li>
                </div>
                ))
            ) : (
                <p>No follower yet</p>
            )
            ) : (
            <p>Loading...</p>
        )}
    </div>
  );
}

export default Follower;
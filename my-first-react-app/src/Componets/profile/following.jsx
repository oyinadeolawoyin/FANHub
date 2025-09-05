import { useEffect, useState } from "react";
import { useUser } from "./usersContext";

function Following() {
  const { user } = useUser();
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    if (user) {
      setFollowing(user.followering);
    }
  }, [user]);

  return (
    <div>
        {following ? (
            following.length > 0 ? (
                following.map((following) => (
                <div key={following.id}>
                    <li>{following.username}</li>
                </div>
                ))
            ) : (
                <p>No following yet</p>
            )
            ) : (
            <p>Loading...</p>
        )}
    </div>
  );
}

export default Following;
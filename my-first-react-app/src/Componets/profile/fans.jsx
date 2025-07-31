import { useEffect, useState } from "react";
import { useUser } from "./usersContext";

function Fans() {
  const { user } = useUser();
  const [fans, setFans] = useState([]);

  useEffect(() => {
    if (user?.fans) {
      setFans(user.fans);
    }
  }, [user]);

  return (
    <div>
      {fans.length > 0 ? (
        fans.map((fan) => (
          fan.image?.collectionId === null && (
            <div key={fan.id}>
              <li>{fan.username}</li>
            </div>
          )
        ))
      ) : (
        <p>No fans yet</p>
      )}
    </div>
  );
}

export default Fans;
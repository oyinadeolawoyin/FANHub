import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Notification() {
  // const navigate = useNavigate();
  const [notifications, setNotifications] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(()=> {
    console.log("not", notifications);
  }, [notifications]);

  useEffect(() => {
    setLoading(true);
    setError("");

    async function fetchUser() {
          try {
            const response = await fetch(`https://fanhub-server.onrender.com/api/notifications`, {
              method: "GET",
              credentials: "include",
            });
              
            const data = await response.json();
            console.log("datauser", data.notifications);
    
            if (!response.ok) {
                setError(data.message || "Something is wrong. Try again!");
                return;
            }
            
            setNotifications(data.notifications);
            
          } catch (err) {
              setError(err.message);
          } finally {
              setLoading(false);
          }
    }
    fetchUser();
  }, []);

  return (
    <div>
      <h1>Notifications</h1>
        {notifications ? (
            notifications.map(notification => (
              <div>
                <p><Link to={notification.link}>{notification.message}</Link></p>
              </div>
            ))
        ):(
          <div>
            {loading && <p>Loading... please wait!</p>}
            {error && <p>{error}</p>}
          </div>
        )}
    </div>
  );
}

export default Notification;
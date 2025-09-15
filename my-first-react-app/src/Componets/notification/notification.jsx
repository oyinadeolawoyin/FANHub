import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Notification() {
  const { id } = useParams();
  const navigate = useNavigate();
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
            const response = await fetch(`https://fanhub-server.onrender.com/api/users/${id}`, {
              method: "GET",
              credentials: "include",
            });
              
            const data = await response.json();
            console.log("datauser", data.user);
    
            if (!response.ok) {
                setError(data.message || "Something is wrong. Try again!");
                return;
            }
            
            setNotifications(data.user.notification);
            
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
            notifications.length > 0 ? (
                notifications.map((notification) => (
                <div key={notification.id}>
                  {notification.type === "story" && (
                        <li onClick={() => navigate(`/stories/${notification.typeId}`)}>{notification.message}</li>
                  )}
                  {notification.type === "collection" && (
                        <li onClick={() => navigate(`/gallery/${notification.typeId}`)}>{notification.message}</li>
                  )}
                  {notification.type === "chapter" && (
                        <li onClick={() => navigate(`/stories/${notification.storyId}/chapters/${notification.typeId}`)}>{notification.message}</li>
                  )}
                  {((notification.type === "image" && notification.collectionId !== null) ||
                    (notification.type === "video" && notification.collectionId !== null)) && (
                      <li onClick={() => navigate(`/gallery/${notification.collectionId}`)}>
                        {notification.message}
                      </li>
                  )}
                  {((notification.type === "image" && notification.collectionId === null) ||
                    (notification.type === "video" && notification.collectionId === null)) && (
                      <li onClick={() => navigate(`/profile/${notification.username}/${notification.galleryId}/gallery`)}>
                        {notification.message}
                      </li>
                  )}
                  {notification.type === "post" && (
                        <li onClick={() => navigate(`/profile/${notification.username}/${notification.typeId}/posts/`)}>{notification.message}</li>
                  )}
                  {notification.type === "review" && notification.storyId !== null && (
                      <li onClick={() => navigate(`/stories/${notification.storyId}/reviews`)}>{notification.message}</li>
                  )} 
                  {notification.type === "review" && notification.collectionId !== null && (
                      <li onClick={() => navigate(`/collections/${notification.collectionId}/reviews`)}>{notification.message}</li>
                  )} 
                  {notification.type === "following" && (
                    <li 
                      onClick={() => navigate(`/profile/${notification.message.split(" ")[0]}/${notification.typeId}`)}
                    >
                      {notification.message}
                    </li>
                  )}
                  {notification.type === "user" && (
                    <li 
                      onClick={() => navigate(`/profile/${notification.message.split(" ")[0]}/${notification.typeId}`)}
                    >
                      {notification.message}
                    </li>
                  )}
                </div>
                ))
            ) : (
                <p>No notification yet</p>
            )
            ) : (
            <div>
               {loading && <p>Loading.... please wait!</p>}
               {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
        )}
    </div>
  );
}

export default Notification;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import Delete from "../delete/delete";

function MediaList({ mediaType }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mediaItems, setMediaItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");

  // Pluralize media type for API endpoint
  const mediaTypePlural = `${mediaType}s`;
  
  // API endpoint based on media type
  const apiEndpoint = `https://fanhub-server.onrender.com/api/gallery/${mediaTypePlural}/${user?.id}`;

  useEffect(() => {
    if (!user || !user.id) return;

    async function fetchMedia() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(apiEndpoint, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (response.status === 500) {
          navigate("/error", { 
            state: { message: data.message || "Process failed" } 
          });
          return;
        } else {
          if (!response.ok && response.status !== 500) {
            setError(data.message);
            return;
          }
        }

        setMediaItems(data[mediaTypePlural]);
        console.log("data", data[mediaTypePlural]);
      } catch (err) {
        navigate("/error", { 
          state: { message: "Network error: Please check your internet connection." } 
        });
      } finally {
        setLoading(false);
      }
    }

    fetchMedia();
  }, [user, apiEndpoint]);

  async function handleDeleteMedia(id) {
    setDeletingId(id);
    try {
      const message = await Delete(
        `https://fanhub-server.onrender.com/api/gallery/${mediaTypePlural}/${id}`
      );
      setDeleteMessage(message);
      setMediaItems((prev) => prev.filter((item) => Number(item.id) !== Number(id)));
    } catch (err) {
      navigate("/error", { 
        state: { message: "Network error: Please check your internet connection." } 
      });
    } finally {
      setDeletingId(null);
    }
  }

  // Render media element based on type
  const renderMediaElement = (item) => {
    if (mediaType === "image") {
      return (
        <img
          src={item.url}
          alt={item.caption}
          style={{ width: "200px" }}
        />
      );
    } else if (mediaType === "video") {
      return (
        <video
          src={item.url}
          controls
          style={{ width: "200px" }}
        />
      );
    }
  };

  return (
    <div>
      {loading ? (
        <p>Loading... please wait</p>
      ) : (
        <div>
          {mediaItems && (
            mediaItems.length > 0 ? (
              mediaItems.map((item) =>
                item.collectionId === null && (
                  <div key={item.id}>
                    <li>
                      {item.uploadedAt} likes: {item._count.likes} comments:{" "}
                      {item._count.comments}
                    </li>
                    <li>{renderMediaElement(item)}</li>
                    <li>{item.caption}</li>
                    <button
                      type="submit"
                      disabled={deletingId === item.id}
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Are you sure you want to delete this ${mediaType}?`
                        );
                        if (confirmed) {
                          handleDeleteMedia(item.id);
                        }
                      }}
                    >
                      {deletingId === item.id
                        ? "Loading..."
                        : deleteMessage !== ""
                        ? deleteMessage
                        : "Delete"}
                    </button>
                  </div>
                )
              )
            ) : (
              <p>No {mediaTypePlural} yet!</p>
            )
          )}
        </div>
      )}
      {error && <p>{error}</p>}
    </div>
  );
}

export default MediaList;
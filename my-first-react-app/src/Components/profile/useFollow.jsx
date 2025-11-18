import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";

export function useFollow(targetUsername, targetUserId) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [followed, setFollowed] = useState("Follow");
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch the target user's data (to check if already followed)
  useEffect(() => {
    if (!targetUserId) return;

    async function fetchUser() {
      try {
        const res = await fetch(
          `https://fanhub-server.onrender.com/api/users/${targetUserId}`,
          { method: "GET", credentials: "include" }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch user");

        setCurrentUser(data.user);

        const followers = data.user.followers || [];
        const isFollowing = followers.some(
          (f) => Number(f.followerId) === Number(user?.id)
        );
        setFollowed(isFollowing ? "Unfollow" : "Follow");
      } catch (err) {
        console.error("Follow hook error:", err);
      }
    }

    fetchUser();
  }, [targetUserId, user]);

  // Toggle Follow/Unfollow
  async function toggleFollow() {
    if (!user) return navigate("/login");
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `https://fanhub-server.onrender.com/api/users/follower/${targetUsername}`,
        { method: "POST", credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Action failed");

      // Refresh follow status
      const refreshed = await fetch(
        `https://fanhub-server.onrender.com/api/users/${targetUserId}`,
        { method: "GET", credentials: "include" }
      );
      const refreshedData = await refreshed.json();
      if (!refreshed.ok)
        throw new Error(refreshedData.message || "Failed to refresh user");

      setCurrentUser(refreshedData.user);

      const isFollowing = refreshedData.user.followers?.some(
        (f) => Number(f.followerId) === Number(user?.id)
      );
      setFollowed(isFollowing ? "Unfollow" : "Follow");
    } catch (err) {
      console.error("Follow error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    followed,
    loading,
    toggleFollow,
    error,
    currentUser,
  };
}
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function Follower() {
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    setError("");

    async function fetchFollowers() {
      try {
        const res = await fetch(
          `https://fanhub-server.onrender.com/api/users/${id}/followers`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();

        if (res.status === 500) {
          navigate("/error", { state: { message: data.message || "Process failed" } });
          return;
        } else if (res.status === 401) {
          navigate("/login");
        } else if (!res.ok) {
          console.error(data.message);
          return;
        }

        setFollowers(data.followers || []);
      } catch (err) {
        navigate("/error", {
          state: {
            message: "Network error: Please check your internet connection.",
          },
        });
      } finally {
        setLoading(false);
      }
    }

    fetchFollowers();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-40" role="status" aria-live="polite">
        <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
        <p className="mt-2 text-sm text-muted-foreground">Loading followers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-red-500 text-center">
        {error}
      </p>
    );
  }

  if (!followers || followers.length === 0) {
    return (
      <p className="text-center text-muted-foreground">No followers yet</p>
    );
  }

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Followers list"
    >
      {followers.map((follower) => (
        <Card
          key={follower.id}
          role="button"
          tabIndex={0}
          onClick={() =>
            navigate(`/profile/${follower.followerusername}/${follower.followerId}/about`)
          }
          onKeyDown={(e) =>
            e.key === "Enter" &&
            navigate(`/profile/${follower.followerusername}/${follower.followerId}/about`)
          }
          className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`View profile of ${follower.follower.username}`}
        >
          <Avatar className="w-12 h-12 sm:w-14 sm:h-14 md:w-30 md:h-30 flex-shrink-0">
            <AvatarImage
              src={follower.follower.img}
              alt={`${follower.follower.username}'s avatar`}
              className="object-cover rounded-full"
            />
            <AvatarFallback>
              <User className="w-6 h-6 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>

          <CardContent className="p-0">
            <p className="font-medium text-foreground text-base md:text-lg">
              {follower.follower.username}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default Follower;
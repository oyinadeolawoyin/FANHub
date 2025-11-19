import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "../auth/usersContext";

export default function SmartAvatar({
  fallbackText = "?",
  size = "md",
  className = "",
}) {
  const { user } = useUser(); // get user directly
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  // when user info becomes available, update the image source
  useEffect(() => {
    if (user?.img) {
      setImageSrc(user.img);
    }
  }, [user]);

  const sizeClass =
    size === "sm"
      ? "h-8 w-8"
      : size === "lg"
      ? "h-14 w-14"
      : "h-10 w-10"; // default md

  return (
    <Avatar className={`${sizeClass} ${className}`}>
      {/* Fallback while no image or image not yet loaded */}
      {(!imageLoaded || imageError || !imageSrc) && (
        <AvatarFallback
          style={{
            backgroundColor: "var(--button-bg)",
            color: "var(--button-text)",
          }}
        >
          {user?.username?.[0]?.toUpperCase() ||
            fallbackText?.[0]?.toUpperCase() ||
            "?"}
        </AvatarFallback>
      )}

      {imageSrc && (
        <AvatarImage
          src={imageSrc}
          alt={user?.username || "User avatar"}
          style={{
            display: imageLoaded && !imageError ? "block" : "none",
          }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
    </Avatar>
  );
}

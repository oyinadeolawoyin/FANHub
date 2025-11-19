import { useParams, Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useFollow } from "./useFollow";
import { useAuth } from "../auth/authContext";
import { useState, useEffect } from "react";
import Header from "../css/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserPlus, UserMinus, Users, Loader2 } from "lucide-react";
import Follower from "./followers";
import Following from "./following";

function Profile() {
  const { user } = useAuth();
  const { id, username } = useParams();
  const { followed, loading, toggleFollow, error } = useFollow(username, id);
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [currentUser, setCurrentUser] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    setShowFollowers(false);
    setShowFollowing(false);
  }, [id, username]);  

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(
          `https://fanhub-server.onrender.com/api/users/${id}`,
          { method: "GET", credentials: "include" }
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

        setCurrentUser(data.user);
      } catch (err) {
        navigate("/error", {
          state: {
            message: "Network error: Please check your internet connection.",
          },
        });
      }
    }

    fetchUser();
  }, [id]);

  const isOwnProfile = user && Number(user.id) === Number(id);
  const navItems = ["about","stories","visual stories","gallery","recommendations","wall","tweets"];
  const currentTab = location.pathname.split("/").pop();

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: darkMode ? "#0f1a2d" : "#f9fafb" }}>
      <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <div className="pt-16">
        {/* Cover Image Section with Profile Info Overlay */}
        <div className="relative">
          {/* Cover Image with Gradient Overlay */}
          <div className="h-40 sm:h-56 md:h-72 lg:h-80 relative overflow-hidden">
            {currentUser?.img ? (
              <>
                <img
                  src={currentUser.img}
                  alt={`${username}'s cover`}
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/90" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/90" />
              </div>
            )}
          </div>

          {/* Profile Info - Desktop Layout */}
          <div className="hidden sm:block absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end gap-6">
                {/* Avatar */}
                <Avatar className="w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 border-4 border-background shadow-2xl flex-shrink-0">
                  {currentUser?.img ? (
                    <AvatarImage src={currentUser.img} alt={`${username}'s avatar`} />
                  ) : (
                    <AvatarFallback className="text-3xl md:text-4xl bg-gradient-to-br from-primary to-purple-600 text-white">
                      {username?.[0]?.toUpperCase() || "G"}
                    </AvatarFallback>
                  )}
                </Avatar>

                {/* User Info */}
                <div className="flex-1 pb-2 min-w-0">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg truncate">
                    {username}
                  </h1>
                  
                  {currentUser?.bio && (
                    <p className="text-sm md:text-base text-white/90 mb-2 line-clamp-2 max-w-2xl drop-shadow-md">
                      {currentUser.bio}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
                    {currentUser?.country && (
                      <span className="flex items-center gap-1">
                        📍 {currentUser.country}
                      </span>
                    )}
                    {currentUser?.gender && (
                      <span className="flex items-center gap-1">
                        👤 {currentUser.gender}
                      </span>
                    )}
                  </div>
                </div>

                {/* Follow Button & Stats */}
                <div className="flex flex-col gap-3 pb-2 flex-shrink-0">
                  {!isOwnProfile && (
                    <Button
                      onClick={toggleFollow}
                      disabled={loading}
                      size="lg"
                      className="shadow-lg whitespace-nowrap"
                      variant={followed === "Following" ? "outline" : "default"}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : followed === "Following" ? (
                        <UserMinus className="w-4 h-4 mr-2" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      {loading ? "Loading..." : followed}
                    </Button>
                  )}
                  
                  {/* Follower Stats */}
                  <div className="flex gap-3 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                    <button 
                      className="flex flex-col items-center hover:opacity-80 transition-opacity min-w-[60px]"
                      onClick={() => setShowFollowers(true)}
                    >
                      <span className="text-base md:text-lg font-bold">
                        {currentUser?._count?.followers || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">Followers</span>
                    </button>
                    <div className="w-px bg-border" />
                    <button 
                      className="flex flex-col items-center hover:opacity-80 transition-opacity min-w-[60px]"
                      onClick={() => setShowFollowing(true)}
                    >
                      <span className="text-base md:text-lg font-bold">
                        {currentUser?._count?.followings || 0}
                      </span>
                      <span className="text-xs text-muted-foreground">Following</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Info - Mobile Layout */}
          <div className="sm:hidden">
            {/* Avatar positioned to overlap cover */}
            <div className="relative -mt-16 px-4 mb-4">
              <Avatar className="w-28 h-28 border-4 border-background shadow-2xl mx-auto">
                {currentUser?.img ? (
                  <AvatarImage src={currentUser.img} alt={`${username}'s avatar`} />
                ) : (
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-purple-600 text-white">
                    {username?.[0]?.toUpperCase() || "G"}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            {/* User Info Below Avatar */}
            <div className="px-4 pb-4 text-center">
              <h1 className="text-xl font-bold mb-2">
                {username}
              </h1>
              
              {currentUser?.bio && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                  {currentUser.bio}
                </p>
              )}
              
              <div className="flex justify-center items-center gap-3 text-sm text-muted-foreground mb-4">
                {currentUser?.country && (
                  <span className="flex items-center gap-1">
                    📍 {currentUser.country}
                  </span>
                )}
                {currentUser?.gender && (
                  <span className="flex items-center gap-1">
                    👤 {currentUser.gender}
                  </span>
                )}
              </div>

              {/* Stats Row */}
              <div className="flex justify-center gap-4 mb-4">
                <button 
                  className="flex flex-col items-center hover:opacity-80 transition-opacity"
                  onClick={() => setShowFollowers(true)}
                >
                  <span className="text-lg font-bold">
                    {currentUser?._count?.followers || 0}
                  </span>
                  <span className="text-xs text-muted-foreground">Followers</span>
                </button>
                <div className="w-px bg-border" />
                <button 
                  className="flex flex-col items-center hover:opacity-80 transition-opacity"
                  onClick={() => setShowFollowing(true)}
                >
                  <span className="text-lg font-bold">
                    {currentUser?._count?.followings || 0}
                  </span>
                  <span className="text-xs text-muted-foreground">Following</span>
                </button>
              </div>

              {/* Follow Button */}
              {!isOwnProfile && (
                <Button
                  onClick={toggleFollow}
                  disabled={loading}
                  className="w-full max-w-xs mx-auto"
                  variant={followed === "Following" ? "outline" : "default"}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : followed === "Following" ? (
                    <UserMinus className="w-4 h-4 mr-2" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  {loading ? "Loading..." : followed}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {navItems.map((tab) => {
                const isActive = currentTab === tab;
                return (
                  <Link
                    key={tab}
                    to={tab}
                    className={`
                      px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200
                      ${isActive 
                        ? "text-primary border-b-2 border-primary" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }
                    `}
                  >
                    {tab.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet />
        </div>

        {/* Followers Modal */}
        {showFollowers && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <Card className="w-full max-w-md max-h-[80vh] flex flex-col">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Followers
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowFollowers(false)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <Follower />
              </div>
            </Card>
          </div>
        )}

        {/* Following Modal */}
        {showFollowing && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <Card className="w-full max-w-md max-h-[80vh] flex flex-col">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Following
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowFollowing(false)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <Following />
              </div>
            </Card>
          </div>
        )}

        {/* Error Toast */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg max-w-sm z-50 animate-in slide-in-from-bottom">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
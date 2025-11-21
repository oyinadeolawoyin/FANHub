import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaInstagram, 
  FaFacebookF, 
  FaTwitter, 
  FaDiscord, 
  FaPatreon
} from "react-icons/fa";
import { 
  Loader2, 
  MessageCircle, 
  Heart, 
  Bookmark, 
  BookOpen, 
  Pen, 
  CalendarCheck,
  Image,
  Video,
  ListChecks,
  Sparkles,
  TrendingUp,
  ExternalLink
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DiscordIcon from "../css/discord";

function About() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `https://fanhub-server.onrender.com/api/users/${id}`,
          { method: "GET", credentials: "include" }
        );
        const data = await response.json();

        if (response.status === 500) {
          navigate("/error", {
            state: { message: data.message || "Process failed" },
          });
          return;
        } else if (response.status === 401) {
          navigate("/login");
        } else if (!response.ok) {
          console.error(data.message);
          return;
        }

        setUser(data.user);
      } catch (err) {
        setError("Network error: Please check your internet connection.");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [id, navigate]);

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Oops! Something went wrong</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) return null;

  const socialLinks = [
    { 
      name: "Instagram", 
      icon: FaInstagram, 
      url: user.instagram, 
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-500/10 to-pink-500/10"
    },
    { 
      name: "Facebook", 
      icon: FaFacebookF, 
      url: user.facebook, 
      color: "from-blue-600 to-blue-400",
      bgColor: "bg-gradient-to-br from-blue-600/10 to-blue-400/10"
    },
    { 
      name: "Twitter", 
      icon: FaTwitter, 
      url: user.twitter, 
      color: "from-sky-500 to-blue-500",
      bgColor: "bg-gradient-to-br from-sky-500/10 to-blue-500/10"
    },
    { 
      name: "Discord", 
      icon: FaDiscord, 
      url: user.discord, 
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-gradient-to-br from-indigo-500/10 to-purple-500/10"
    },
    { 
      name: "Patroen", 
      icon: FaPatreon, 
      url: user.donation, 
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-gradient-to-br from-indigo-500/10 to-purple-500/10"
    }
  ];

  const contentStats = [
    { label: "Stories", value: user._count?.stories || 0, icon: BookOpen, color: "text-blue-500" },
    { label: "Visual stories", value: user._count?.collection || 0, icon: Bookmark, color: "text-purple-500" },
    { label: "Images", value: user._count?.images || 0, icon: Image, color: "text-pink-500" },
    { label: "Videos", value: user._count?.videos || 0, icon: Video, color: "text-red-500" },
    { label: "Lists", value: user._count?.recommendations || 0, icon: ListChecks, color: "text-green-500" }
  ];

  const contributionStats = [
    { label: "Comments", value: user?.social?.commentpoint || 0, icon: MessageCircle, color: "text-blue-500" },
    { label: "Reviews", value: user?.social?.reviewpoint || 0, icon: Pen, color: "text-purple-500" },
    { label: "Likes", value: user?.social?.likepoint || 0, icon: Heart, color: "text-red-500" },
    { label: "Reading", value: user?.social?.readingpoint || 0, icon: BookOpen, color: "text-green-500" },
    { label: "Writing", value: user?.social?.writingpoint || 0, icon: Sparkles, color: "text-yellow-500" }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* Hero Section - Content Overview */}
      <Card className="overflow-hidden border-2">
        <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-primary to-purple-600 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">Content Portfolio</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {contentStats.map((stat) => (
              <div 
                key={stat.label}
                className="bg-card rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                <p className="text-2xl sm:text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Social Media Links - Only show if user has at least one link */}
      {socialLinks.some(social => social.url && social.url.trim() !== "") && (
        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Connect With Me</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {socialLinks
                .filter(social => social.url && social.url.trim() !== "")
                .map((social) => {
                  const Icon = social.icon;
                  
                  return (
                    <Button
                      key={social.name}
                      variant="outline"
                      className={`${social.bgColor} h-auto p-4 sm:p-5 flex items-center justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-2`}
                      onClick={() => window.open(social.url, "_blank")}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 bg-gradient-to-br ${social.color} rounded-lg flex-shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-sm sm:text-base">
                          Follow on {social.name}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    </Button>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contribution Points */}
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Contribution Points</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {contributionStats.map((stat) => (
              <div 
                key={stat.label}
                className="bg-muted/50 rounded-xl p-4 text-center hover:bg-muted transition-all duration-300"
              >
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <p className="text-xl sm:text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Streaks */}
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <CalendarCheck className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Activity Streaks</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="inline-flex p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                <Pen className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold mb-2">{user?.writestreak || 0}</p>
              <p className="text-sm text-muted-foreground">Day Writing Streak</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="inline-flex p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold mb-2">{user?.readstreak || 0}</p>
              <p className="text-sm text-muted-foreground">Day Reading Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

export default About;
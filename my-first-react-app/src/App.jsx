import { useAuth } from "./Components/auth/authContext";
import { Link, Outlet, useNavigate } from "react-router-dom";
import NotificationsSetup from "./Components/notification/notificationSetup";
import { useState, useEffect } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Header from "./Components/css/header";
import "./Components/css/index.css";
import { useFollow } from "./Components/profile/useFollow";

const App = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [api, setApi] = useState(null);
  const [topWriters, setTopWriters] = useState([]);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Fetch top 30 writers
  useEffect(() => {
    async function fetchTopWriters() {
      try {
        const res = await fetch(
          `https://fanhub-server.onrender.com/api/users/top-writers`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await res.json();

        if (res.status === 500) {
          navigate("/error", {
            state: { message: data.message || "Process failed" },
          });
          return;
        } else if (res.status === 401) {
          navigate("/login");
        } else if (!res.ok) {
          console.error(data.message);
          return;
        }

        setTopWriters(data.writers || []);
      } catch (err) {
        console.error("Failed to fetch top writers:", err);
      }
    }

    fetchTopWriters();
  }, [navigate]);

  // Mock featured content
  const [featuredContent] = useState([
    {
      id: 1,
      title: "The Future of Web Development",
      author: "Sarah Chen",
      description:
        "Exploring the latest trends in modern web architecture and design patterns.",
      category: "Technology",
    },
    {
      id: 2,
      title: "Building Communities That Last",
      author: "Marcus Williams",
      description:
        "Insights on creating engaging and sustainable online communities.",
      category: "Community",
    },
    {
      id: 3,
      title: "Stories That Inspire Change",
      author: "Elena Rodriguez",
      description:
        "How authentic storytelling can transform lives and perspectives.",
      category: "Inspiration",
    },
    {
      id: 4,
      title: "The Art of Digital Expression",
      author: "James Park",
      description: "Discovering new ways to share ideas in the digital age.",
      category: "Creative",
    },
  ]);

  // Auto-scroll carousel
  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => api.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [api]);

  return (
    <div
      className="min-h-screen transition-colors duration-500"
      style={{
        backgroundColor: "var(--background-color)",
        color: "var(--foreground-color)",
      }}
    >
      {user && <NotificationsSetup user={user} />}

      {/* HEADER */}
      <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Spacer so content isn't hidden behind fixed navbar */}
      <div className="h-6"></div>

      {/* MAIN CONTENT */}
      <main className="px-4 py-10 md:px-8 pt-32 md:pt-36 transition-colors duration-500">
        {/* FEATURED SECTION */}
        <section className="mb-12 w-full max-w-7xl mx-auto">
          <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {featuredContent.map((item) => (
                <CarouselItem key={item.id} className="pl-2 md:pl-4">
                  <div
                    className="rounded-lg overflow-hidden p-[1px] transition-all duration-500"
                    style={{
                      background: "linear-gradient(135deg, #60a5fa, #a855f7, #ec4899)",
                    }}
                  >
                    <div
                      className="rounded-lg p-6 h-56 sm:h-64 flex flex-col justify-between"
                      style={{
                        backgroundColor: "var(--card-bg)",
                        color: "var(--card-text)",
                      }}
                    >
                      <div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full"
                              style={{
                                backgroundColor: darkMode ? "rgba(255,255,255,0.15)" : "rgba(59,130,246,0.15)",
                                color: "var(--button-bg)",
                              }}>
                          {item.category}
                        </span>
                        <h3 className="text-2xl font-bold mt-2 mb-1">{item.title}</h3>
                        <p className="text-sm opacity-80">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                          style={{
                            background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
                            color: "#fff",
                          }}
                        >
                          {item.author[0]}
                        </div>
                        <div>
                          <p className="text-xs opacity-70">Featured Writer</p>
                          <p className="font-semibold">{item.author}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex left-2 md:left-4" />
            <CarouselNext className="hidden sm:flex right-2 md:right-4" />
          </Carousel>
        </section>

        {/* Outlet with proper alignment */}
        <div className="w-full max-w-7xl mx-auto mb-12">
          <Outlet />
        </div>

        {/* TOP WRITERS */}
        <section className="w-full max-w-7xl mx-auto">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4 px-2"
            style={{ color: "var(--foreground-color)" }}
          >
           Top Writers of the Week to Follow ✨
          </h2>

          <div
            className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide px-1 md:px-2 snap-x snap-mandatory"
            style={{
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {topWriters.map((writer) => (
              <div key={writer.id} className="snap-start">
                <TopWriterCard writer={writer} darkMode={darkMode} />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

// TOP WRITER CARD
export function TopWriterCard({ writer }) {
  const { followed, loading, toggleFollow } = useFollow(
    writer.username,
    writer.id
  );
  const navigate = useNavigate();

  return (
    <div
      className="flex-shrink-0 w-36 md:w-44 rounded-lg p-3 transition-all duration-300 hover:shadow-lg"
      style={{
        backgroundColor: "var(--card-bg)",
        color: "var(--card-text)",
        border: "1px solid var(--border-color)",
      }}
    >
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-14 w-14 mb-2">
          <AvatarImage src={writer.img} alt={writer.username} />
          <AvatarFallback
            style={{
              backgroundColor: "var(--button-bg)",
              color: "var(--button-text)",
            }}
          >
            {writer.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <p
          className="font-semibold cursor-pointer hover:underline transition-all duration-300"
          style={{ color: "var(--card-text)" }}
          onClick={() =>
            navigate(`/profile/${writer.username}/${writer.id}/about`)
          }
        >
          {writer.username}
        </p>
        <p className="text-sm opacity-70">
          {writer.social.writingpoint} pts
        </p>
        <button
          onClick={toggleFollow}
          disabled={loading}
          className="mt-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 hover:opacity-90"
          style={{
            backgroundColor:
              followed === "Follow" ? "var(--button-bg)" : "transparent",
            color:
              followed === "Follow"
                ? "var(--button-text)"
                : "var(--card-text)",
            border:
              followed === "Follow"
                ? "none"
                : "1px solid var(--border-color)",
          }}
        >
          {loading ? "..." : followed}
        </button>
      </div>
    </div>
  );
}

export default App;
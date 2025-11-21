import { useState, useEffect } from "react";
import { useAuth } from "../auth/authContext";
import Header from "../css/header";
import Footer from "../css/footer";
import { Construction, Hammer, Wrench, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Blog() {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-500"
      style={{
        backgroundColor: "var(--background-color)",
        color: "var(--foreground-color)",
      }}
    >
      {/* HEADER */}
      <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Spacer */}
      <div className="h-6"></div>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 md:px-8 pt-32 md:pt-36">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Animated Construction Icon */}
          <div className="relative inline-block">
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-30"
              style={{ backgroundColor: "var(--button-bg)" }}
            ></div>
            <div
              className="relative p-8 rounded-full"
              style={{ backgroundColor: "rgba(37, 99, 235, 0.1)" }}
            >
              <Construction
                className="w-24 h-24 animate-bounce"
                style={{ color: "var(--button-bg)" }}
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1
              className="text-4xl md:text-5xl font-bold"
              style={{ color: "var(--foreground-color)" }}
            >
              Blog Coming Soon
            </h1>
            <p
              className="text-lg md:text-xl"
              style={{ color: "var(--secondary-text)" }}
            >
              We're working hard to bring you amazing content!
            </p>
          </div>

          {/* Description */}
          <div
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <Hammer
                className="w-6 h-6 animate-spin-slow"
                style={{ color: "var(--button-bg)" }}
              />
              <Wrench
                className="w-6 h-6 animate-spin-slow"
                style={{ color: "var(--button-bg)" }}
              />
            </div>
            <p style={{ color: "var(--secondary-text)" }}>
              Our blog is currently under development. Check back soon for
              articles, tutorials, writing tips, and community stories from
              The Voices platform.
            </p>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "var(--button-bg)",
              color: "var(--button-text)",
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          {/* Progress Indicator */}
          <div className="pt-8">
            <p
              className="text-sm mb-3"
              style={{ color: "var(--secondary-text)" }}
            >
              Development Progress
            </p>
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--border-color)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500 animate-pulse"
                style={{
                  width: "60%",
                  background: "var(--creative-gradient)",
                }}
              ></div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

export default Blog;
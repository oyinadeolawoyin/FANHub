import { useState, useEffect } from "react";
import { useAuth } from "../auth/authContext";
import Header from "../css/header";
import Footer from "../css/footer";
import { Users, Target, Heart, ArrowLeft, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AboutUs() {
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
        <div className="max-w-3xl w-full text-center space-y-8">
          {/* Animated Logo/Icon */}
          <div className="relative inline-block">
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-30 animate-pulse"
              style={{ backgroundColor: "var(--button-bg)" }}
            ></div>
            <div
              className="relative p-8 rounded-full"
              style={{ backgroundColor: "rgba(37, 99, 235, 0.1)" }}
            >
              <Users
                className="w-24 h-24"
                style={{ color: "var(--button-bg)" }}
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1
              className="text-4xl md:text-5xl font-bold flex items-center justify-center gap-3"
              style={{ color: "var(--foreground-color)" }}
            >
              About The Voices
              <Sparkles
                className="w-8 h-8 animate-pulse"
                style={{ color: "var(--button-bg)" }}
              />
            </h1>
            <p
              className="text-lg md:text-xl max-w-2xl mx-auto"
              style={{ color: "var(--secondary-text)" }}
            >
              This page is currently being crafted to tell our story
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            {/* Mission Card */}
            <div
              className="p-6 rounded-xl border transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--border-color)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "rgba(37, 99, 235, 0.1)" }}
              >
                <Target
                  className="w-6 h-6"
                  style={{ color: "var(--button-bg)" }}
                />
              </div>
              <h3
                className="font-bold text-lg mb-2"
                style={{ color: "var(--foreground-color)" }}
              >
                Our Mission
              </h3>
              <p className="text-sm" style={{ color: "var(--secondary-text)" }}>
                Empowering voices through creative storytelling
              </p>
            </div>

            {/* Vision Card */}
            <div
              className="p-6 rounded-xl border transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--border-color)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "rgba(37, 99, 235, 0.1)" }}
              >
                <Sparkles
                  className="w-6 h-6"
                  style={{ color: "var(--button-bg)" }}
                />
              </div>
              <h3
                className="font-bold text-lg mb-2"
                style={{ color: "var(--foreground-color)" }}
              >
                Our Vision
              </h3>
              <p className="text-sm" style={{ color: "var(--secondary-text)" }}>
                Building a global community of storytellers
              </p>
            </div>

            {/* Values Card */}
            <div
              className="p-6 rounded-xl border transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--border-color)",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "rgba(37, 99, 235, 0.1)" }}
              >
                <Heart
                  className="w-6 h-6"
                  style={{ color: "var(--button-bg)" }}
                />
              </div>
              <h3
                className="font-bold text-lg mb-2"
                style={{ color: "var(--foreground-color)" }}
              >
                Our Values
              </h3>
              <p className="text-sm" style={{ color: "var(--secondary-text)" }}>
                Creativity, community, and authenticity
              </p>
            </div>
          </div>

          {/* Under Development Notice */}
          <div
            className="p-6 rounded-xl border"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border-color)",
            }}
          >
            <p
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--foreground-color)" }}
            >
              🚧 Page Under Development
            </p>
            <p style={{ color: "var(--secondary-text)" }}>
              We're working on a comprehensive About Us page that will share
              our journey, team, and the story behind The Voices platform.
              Stay tuned!
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
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

export default AboutUs;
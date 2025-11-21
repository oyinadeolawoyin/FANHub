import { useState, useEffect } from "react";
import { useAuth } from "../auth/authContext";
import Header from "../css/header";
import Footer from "../css/footer";
import {
  Settings,
  Zap,
  Shield,
  Rocket,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Service() {
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

  const features = [
    { icon: Zap, title: "Fast & Reliable", description: "Lightning-fast performance" },
    { icon: Shield, title: "Secure Platform", description: "Your data is protected" },
    { icon: Rocket, title: "Easy to Use", description: "Intuitive interface" },
  ];

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
        <div className="max-w-4xl w-full text-center space-y-8">
          {/* Animated Icon */}
          <div className="relative inline-block">
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-30 animate-pulse"
              style={{ backgroundColor: "var(--button-bg)" }}
            ></div>
            <div
              className="relative p-8 rounded-full"
              style={{ backgroundColor: "rgba(37, 99, 235, 0.1)" }}
            >
              <Settings
                className="w-24 h-24 animate-spin-slow"
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
              Our Services
            </h1>
            <p
              className="text-lg md:text-xl max-w-2xl mx-auto"
              style={{ color: "var(--secondary-text)" }}
            >
              Discover the features and services we're building for you
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6 pt-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-xl border transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: "rgba(37, 99, 235, 0.1)" }}
                  >
                    <Icon
                      className="w-8 h-8"
                      style={{ color: "var(--button-bg)" }}
                    />
                  </div>
                  <h3
                    className="font-bold text-xl mb-2"
                    style={{ color: "var(--foreground-color)" }}
                  >
                    {feature.title}
                  </h3>
                  <p style={{ color: "var(--secondary-text)" }}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Current Services */}
          <div
            className="p-8 rounded-xl border text-left"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--border-color)",
            }}
          >
            <h2
              className="text-2xl font-bold mb-6 text-center"
              style={{ color: "var(--foreground-color)" }}
            >
              What We Offer Right Now
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Creative Writing Platform",
                "Community Engagement",
                "Visual Storytelling",
                "Reading Lists & Collections",
                "User Profiles & Portfolios",
                "Interactive Comments",
              ].map((service, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: "var(--button-bg)" }}
                  />
                  <span style={{ color: "var(--foreground-color)" }}>
                    {service}
                  </span>
                </div>
              ))}
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
              🚀 Coming Soon
            </p>
            <p style={{ color: "var(--secondary-text)" }}>
              We're constantly working on new features and services to enhance
              your experience. This page will be updated with detailed
              information about our premium services, API access, and
              partnership opportunities.
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

export default Service;
import { useEffect, useState  } from "react";
import { useLocation, Link } from "react-router-dom";
import Header from "../css/header";
import { TriangleAlert } from "lucide-react";

export default function Errorpage() {
  const location = useLocation();
  const { message } =
    location.state || { message: "An unexpected error occurred." };

  // Local dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    // Load from localStorage if exists
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    // Apply or remove dark class on <html>
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-theme text-theme">
      {/* HEADER with internal dark mode toggle */}
      <Header
        user={null} // no user needed
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* PAGE CONTENT */}
      <div className="pt-32 flex justify-center px-4">
        <div className="card w-full max-w-lg text-center animate-fadeIn p-8">
          <div className="flex justify-center mb-4">
            <TriangleAlert className="w-12 h-12 text-red-500" />
          </div>

          <h1 className="text-2xl font-semibold mb-2">Oops! Something went wrong</h1>

          <p className="text-secondary mb-6">{message}</p>

          <Link
            to="/"
            className="btn w-full text-center"
            style={{ textDecoration: "none" }}
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
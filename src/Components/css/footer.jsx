import { Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import DiscordIcon from "./discord";

const Footer = () => {
  return (
    <footer
      className="w-full border-t transition-colors duration-500 mt-auto"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--border-color)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Links Section */}
          <nav className="flex flex-wrap items-center justify-center gap-6 md:gap-8" aria-label="Footer navigation">
            <Link
              to="/blog"
              className="text-sm font-medium transition-all duration-300 hover:underline"
              style={{ color: "var(--foreground-color)" }}
            >
              Blog
            </Link>
            <Link
              to="/about us"
              className="text-sm font-medium transition-all duration-300 hover:underline"
              style={{ color: "var(--foreground-color)" }}
            >
              About Us
            </Link>
            <Link
              to="/service"
              className="text-sm font-medium transition-all duration-300 hover:underline"
              style={{ color: "var(--foreground-color)" }}
            >
              Service
            </Link>
          </nav>

          {/* Social Media Icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/yourpage"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
              style={{
                backgroundColor: "rgba(37, 99, 235, 0.1)",
                color: "var(--accent-color)",
              }}
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com/yourpage"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
              style={{
                backgroundColor: "rgba(37, 99, 235, 0.1)",
                color: "var(--accent-color)",
              }}
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://discord.gg/yourserver"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
              style={{
                backgroundColor: "rgba(37, 99, 235, 0.1)",
                color: "var(--accent-color)",
              }}
              aria-label="Discord"
            >
              <DiscordIcon className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: "var(--border-color)" }}>
          <p
            className="text-sm"
            style={{ color: "var(--secondary-text)" }}
          >
            © 2025 The Voices. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
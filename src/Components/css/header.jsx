// components/Header.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SmartAvatar from "../utils/SmartAvatar";
import { SquareLogo } from "./logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  Moon,
  Sun,
  Users,
  Layers,
  BookOpen,
  User,
  LayoutDashboard,
  PenLine,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";

export default function Header({ user, darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
        className="fixed top-0 left-0 w-full z-50 shadow-sm transition-colors duration-500"
        style={{
            backgroundColor: "var(--header-bg)",
            color: "var(--header-text)",
            borderBottom: "1px solid var(--border-color)",
        }}
    >
        <nav className="flex justify-between items-center px-4 md:px-6 py-4">
            {/* LOGO */}
            <div className="flex items-center gap-2">
                <Link to="/">
                    <SquareLogo theme={darkMode ? "dark" : "light"} size={18} />
                </Link>
            </div>

            {/* DESKTOP NAV */}
            {user ? (
              <div className="hidden md:flex items-center gap-8">
                <Link to="/tweets" className="nav-link">
                  Community
                </Link>
                <Link to="/homestories" className="nav-link">
                  Stories
                </Link>
                <Link to="/visual stories" className="nav-link">
                  Visual stories
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-md transition-all duration-300 font-medium"
                  style={{
                    color: "var(--button-bg)",
                  }}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 rounded-md transition-all duration-300 font-medium"
                  style={{
                    backgroundColor: "var(--button-bg)",
                    color: "var(--button-text)",
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-3">
            {/* 🌗 THEME TOGGLE */}
            <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-md transition-all duration-300"
                style={{
                backgroundColor: "var(--hover-bg)",
                }}
                aria-label="Toggle Theme"
            >
                {darkMode ? (
                <Sun className="h-5 w-5" style={{ color: "var(--button-bg)" }} />
                ) : (
                <Moon className="h-5 w-5" style={{ color: "var(--button-bg)" }} />
                )}
            </button>

            {/* 📱 MOBILE MENU (Hamburger) - Only show if user is logged in */}
            {user && (
              <div className="md:hidden">
                <Sheet>
                <SheetTrigger asChild>
                    <button
                    className="p-2 rounded-md transition-all duration-300"
                    style={{
                        backgroundColor: "var(--hover-bg)",
                    }}
                    aria-label="Open Menu"
                    >
                    <Menu className="h-5 w-5" style={{ color: "var(--button-bg)" }} />
                    </button>
                </SheetTrigger>

                <SheetContent
                    side="left"
                    className="w-64 transition-colors duration-500"
                    style={{
                    backgroundColor: "var(--card-bg)",
                    color: "var(--card-text)",
                    }}
                >
                    <div className="flex flex-col gap-4 mt-8">
                    <Link
                        to="/tweets"
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700/10 transition-all"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <Users className="w-5 h-5 text-blue-400" />
                        Community
                    </Link>

                    <Link
                        to="/homestories"
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700/10 transition-all"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <BookOpen className="w-5 h-5 text-purple-400" />
                        Stories
                    </Link>

                    <Link
                        to="/homecollections"
                        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-700/10 transition-all"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <Layers className="w-5 h-5 text-pink-400" />
                        Collections
                    </Link>
                    </div>
                </SheetContent>
                </Sheet>
              </div>
            )}

            {/* Mobile Login/Signup buttons for non-authenticated users */}
            {!user && (
              <div className="flex md:hidden items-center gap-2">
                <Link 
                  to="/login" 
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300"
                  style={{
                    color: "var(--button-bg)",
                  }}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300"
                  style={{
                    backgroundColor: "var(--button-bg)",
                    color: "var(--button-text)",
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* USER AVATAR */}
            {user && (
                <UserMenu
                user={user}
                navigate={navigate}
                darkMode={darkMode}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                />
            )}
            </div>
        </nav>
    </header>
  );
}

// USER MENU COMPONENT
function UserMenu({ user, navigate, darkMode, menuOpen, setMenuOpen }) {
  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="focus:outline-none rounded-full transition-all duration-300"
          style={{
            boxShadow: darkMode
              ? "0 0 0 2px rgba(255, 255, 255, 0.3)"
              : "0 0 0 2px rgba(37, 99, 235, 0.3)",
          }}
        >
          <SmartAvatar size="md" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 p-2 border rounded-lg shadow-lg"
        style={{
          backgroundColor: "var(--card-bg)",
          color: "var(--card-text)",
          borderColor: "var(--border-color)",
        }}
      >
        {/* USER INFO */}
        <div className="px-3 py-2 border-b border-gray-700/40">
          <p className="font-semibold text-sm">{user?.username}</p>
          <p className="text-xs opacity-70">{user?.email}</p>
        </div>

        {/* SECTION 1 */}
        <div className="py-1 border-b border-gray-700/40">
          <DropdownMenuItem
            onClick={() => navigate(`/profile/${user?.username}/${user?.id}/about`)}
            className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md hover:bg-gray-700/20"
          >
            <User className="w-4 h-4 text-blue-400" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => navigate(`/dashboard/stories/${user?.id}`)}
            className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md hover:bg-gray-700/20"
          >
            <LayoutDashboard className="w-4 h-4 text-purple-400" />
            Dashboard
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => navigate(`/library/${user?.id}`)}
            className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md hover:bg-gray-700/20"
          >
            <BookOpen className="w-4 h-4 text-green-400" />
            Library
          </DropdownMenuItem>
        </div>

        {/* SECTION 2 */}
        <div className="py-1 border-b border-gray-700/40">
          <DropdownMenuItem
            onClick={() => navigate("/create-tweet")}
            className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md hover:bg-gray-700/20"
          >
            <PenLine className="w-4 h-4 text-yellow-400" />
            Tweet
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => navigate(`/settings/${user?.id}`)}
            className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md hover:bg-gray-700/20"
          >
            <Settings className="w-4 h-4 text-indigo-400" />
            Settings
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => navigate(`/notification/${user?.id}`)}
            className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md hover:bg-gray-700/20"
          >
            <Bell className="w-4 h-4 text-pink-400" />
            Notification
          </DropdownMenuItem>
        </div>

        {/* LOGOUT */}
        <div className="pt-1">
          <DropdownMenuItem
            onClick={() => navigate("/logout")}
            className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
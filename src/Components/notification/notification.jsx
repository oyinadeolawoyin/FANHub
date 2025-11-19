import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Loader2, Inbox, CheckCircle } from "lucide-react";
import Header from "../css/header";
import { useAuth } from "../auth/authContext";
import { useToast } from "../utils/toast-modal";

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const { showToast } = useToast();

  // ✅ Apply theme mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // ✅ Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "https://fanhub-server.onrender.com/api/notifications",
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Something went wrong. Try again!");
          return;
        }

        // Format read/unread notifications
        const formatted = data.notifications.map((n) => ({
          ...n,
          isUnread: n.read === false || n.read === null,
        }));

        setNotifications(formatted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  // ✅ Mark all notifications as read
  async function handleMarkAllAsRead() {
    try {
      const response = await fetch(
        `https://fanhub-server.onrender.com/api/notifications/${user.id}/read`,  // Fixed endpoint
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to mark all as read");
      }

      // Update UI locally
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isUnread: false, read: true }))
      );
    } catch (err) {
      console.error(err);
      handleNotificationError(err);
    }
  }

  function handleNotificationError(err) {
    showToast(err.message || "Failed to mark notifications as read", "error");
  }

  const unreadExists = notifications.some((n) => n.isUnread);

  return (
    <div className="min-h-screen bg-theme">
      {/* Fixed Header */}
      <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Page Container */}
      <div className="pt-28 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Page Title & Mark All Button */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-theme flex items-center gap-3">
              <Bell className="w-8 h-8 text-[#2563eb]" />
              Notifications
              {unreadExists && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {notifications.filter(n => n.isUnread).length}
                </span>
              )}
            </h1>
            <p className="text-secondary mt-2">
              Stay updated with your latest activity
            </p>
          </div>

          {/* ✅ Mark All as Read */}
          {unreadExists && (
            <button
              onClick={handleMarkAllAsRead}
              className="bg-[#2563eb] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Mark All as Read
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-[#2563eb] animate-spin mb-4" />
            <p className="text-secondary text-lg">Loading notifications...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Notifications */}
        {!loading && !error && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`card block transition-all duration-300 relative ${
                  notification.isUnread
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500"
                    : "bg-card-theme"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Red Dot for Unread */}
                  {notification.isUnread && (
                    <div className="absolute top-4 left-4">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.isUnread 
                      ? 'bg-[#2563eb] ml-6' 
                      : 'bg-[#2563eb]/10'
                  }`}>
                    <Bell className={`w-5 h-5 ${
                      notification.isUnread ? 'text-white' : 'text-[#2563eb]'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link 
                      to={notification.link}
                      className="block hover:opacity-80 transition-opacity"
                    >
                      <p className={`text-base ${
                        notification.isUnread 
                          ? 'text-theme font-semibold' 
                          : 'text-theme font-normal'
                      }`}>
                        {notification.message}
                      </p>
                      {notification.createdAt && (
                        <p className="text-secondary text-sm mt-1">
                          {new Date(notification.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </p>
                      )}
                    </Link>
                  </div>

                  {/* Read Status Badge */}
                  {!notification.isUnread && (
                    <div className="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
                      <CheckCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Read</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading &&
          !error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Inbox className="w-20 h-20 text-gray-300 dark:text-gray-700 mb-4" />
              <h2 className="text-2xl font-semibold text-theme mb-2">
                No notifications yet
              </h2>
              <p className="text-secondary mb-6 max-w-md">
                When you receive notifications, they'll appear here.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Notification;
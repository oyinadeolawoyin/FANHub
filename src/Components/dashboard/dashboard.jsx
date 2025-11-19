import { useAuth } from "../auth/authContext";
import { Outlet, Link } from "react-router-dom";
import Header from "../css/header";
import { useState, useEffect } from "react";
import { 
  Menu, 
  FileText, 
  BookOpen, 
  FolderPlus, 
  Folders, 
  ImagePlus, 
  Video, 
  Image, 
  Film, 
  LayoutDashboard,
  ListChecks
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function Dashboard() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Unique colors per nav item
  const navItems = [
    { to: `stories/${user?.id}`, icon: BookOpen, label: "My Stories", color: "#64b5f6" },
    { to: `visual stories/${user?.id}`, icon: Folders, label: "Visual stories", color: "yellow" },
    { to: "images", icon: Image, label: "Images", color: "green" },
    { to: "videos", icon: Film, label: "Videos", color: "red" },
    { to: "recommendation list", icon: ListChecks, label: "My Rec Lists", color: "#ff6f00" },
  ];

  const SidebarContent = () => (
    <nav className="flex flex-col gap-1 p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-800 dark:text-gray-100 transition-all duration-300 hover:translate-x-1"
            style={{
              borderLeft: `4px solid ${item.color}`,
            }}
            onClick={() => isMobile && setIsOpen(false)}
          >
            <Icon className="w-5 h-5 flex-shrink-0" style={{ color: item.color }} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
      <Header user={user} darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="h-1"></div>

      <div className="flex pt-[90px]">
        {/* Mobile Sidebar */}
        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg lg:hidden bg-gradient-to-tr from-purple-500 to-blue-500 text-white border-none"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 p-0 border-none pt-[73px] bg-gradient-to-b from-white to-gray-100 dark:from-gray-800 dark:to-gray-900"
            >
              <div className="py-6">
                <h2 className="px-6 text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800 dark:text-gray-100">
                  <LayoutDashboard className="text-blue-500 w-5 h-5" />
                  Dashboard
                </h2>
                <SidebarContent />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          /* Desktop Sidebar */
          <aside
            className="w-72 h-[calc(100vh-73px)] fixed left-0 top-[90px] overflow-y-auto custom-scrollbar border-r border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-100 dark:from-gray-800 dark:to-gray-900"
          >
            <div className="py-6 mt-2">
              <h2 className="px-6 text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800 dark:text-gray-100">
                <LayoutDashboard className="text-blue-500 w-5 h-5" />
                Dashboard
              </h2>
              <SidebarContent />
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 min-h-[calc(100vh-73px)] ${!isMobile ? "ml-72" : ""}`}>
          <div className="p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
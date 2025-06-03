import { useEffect } from "react";
import { useAuth } from "./authContext";
import { useNavigate } from "react-router-dom";

function Logout() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function logout() {
      try {
        await fetch("https://fanhub-server.onrender.com/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (err) {
        console.error("Logout failed:", err);
      } finally {
        localStorage.removeItem("user"); 
        setUser(null);                  
        navigate("/");                 
      }
    }

    logout();
  }, [setUser, navigate]);

  return null;
}

export default Logout;
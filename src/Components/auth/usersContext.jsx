import { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./authContext";

const UserContext = createContext();

export function  UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user: authUser } = useAuth();

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`https://fanhub-server.onrender.com/api/users/${authUser.id}`, {
          method: "GET",
          headers: { 
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message);
          return;
        }
        console.log("dataUser", data);
        setUser(data.user);
      } catch (err) {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return(
    <UserContext.Provider value={{ user, setUser, loading, error }}>
        {children}
    </UserContext.Provider>
  )
}

export function useUser() {
    return useContext(UserContext);
}
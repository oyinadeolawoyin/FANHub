import { createContext, useEffect, useState, useContext } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("https://fanhub-server.onrender.com/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (error) {
        setUser(null);
        localStorage.removeItem("user");
      }
    }

    if (!user) {
      fetchUser();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
    return useContext(AuthContext);
}
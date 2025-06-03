import { createContext, useState, useEffect, useContext } from "react";

const UsersContext = createContext();

export function  UsersProvider({ children }) {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("https://fanhub-server.onrender.com/api/users/fans", {
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
        setUsers(data.users);
      } catch (err) {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return(
    <UsersContext.Provider value={{ users, setUsers, loading, error }}>
        {children}
    </UsersContext.Provider>
  )
}

export function useUsers() {
    return useContext(UsersContext);
}
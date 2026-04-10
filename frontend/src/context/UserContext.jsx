import { createContext, useContext, useState, useEffect } from "react";
import { fetchUsers } from "../api/wellApi";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetchUsers();
      setUsers(res.data || []);

      // Restore saved user from localStorage
      const savedId = localStorage.getItem("aquaguard_user_id");
      if (savedId) {
        const found = (res.data || []).find((u) => u._id === savedId);
        if (found) setCurrentUser(found);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectUser = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem("aquaguard_user_id", user._id);
    } else {
      localStorage.removeItem("aquaguard_user_id");
    }
  };

  return (
    <UserContext.Provider value={{ users, currentUser, selectUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};

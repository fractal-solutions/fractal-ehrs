import React, { createContext, useContext, useState, useEffect } from 'react';

// User roles
export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  SECRETARY: 'secretary',
  ASSISTANT: 'assistant',
};

const USERS_KEY = 'fractal-ehrs-users';
const SESSION_KEY = 'fractal-ehrs-session';

// Initial admin user
const initialAdmin = {
  username: 'admin',
  password: '12345678',
  name: 'Admin User',
  role: ROLES.ADMIN,
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  // Load users and session from localStorage
  useEffect(() => {
    let storedUsers = JSON.parse(localStorage.getItem(USERS_KEY));
    if (!storedUsers || !storedUsers.length) {
      storedUsers = [initialAdmin];
      localStorage.setItem(USERS_KEY, JSON.stringify(storedUsers));
    }
    setUsers(storedUsers);
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (session) setUser(session);
  }, []);

  // Save users to localStorage
  const saveUsers = (newUsers) => {
    setUsers(newUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
  };

  // Login
  const login = (username, password) => {
    const found = users.find(
      (u) => u.username === username && u.password === password
    );
    if (found) {
      setUser(found);
      localStorage.setItem(SESSION_KEY, JSON.stringify(found));
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  // Register (admin only)
  const register = (newUser) => {
    if (users.some((u) => u.username === newUser.username)) {
      return { success: false, message: 'Username already exists' };
    }
    const updated = [...users, newUser];
    saveUsers(updated);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 
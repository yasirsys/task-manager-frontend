import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "@/api/authApi";
import { useNavigate } from "react-router-dom";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Load profile if token exists
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      authApi
        .getProfile()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("accessToken");
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // 🔐 Login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const payload = res.data;
      localStorage.setItem("accessToken", payload.accessToken);
      setUser(payload.user);
      navigate("/dashboard");
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 🆕 Signup
  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.signup({ name, email, password });
      const payload = res.data;

      localStorage.setItem("accessToken", payload.accessToken);
      setUser(payload.user);
      navigate("/dashboard");
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

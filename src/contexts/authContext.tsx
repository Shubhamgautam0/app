import React, { createContext, useContext, useState, ReactNode } from "react";
import { LoginApi } from "../api/apiClient";
import axios from "axios"; 

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const login = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    let csrfToken = localStorage.getItem("csrfToken") || "";

    try {
      if (!csrfToken) {
        const response = await LoginApi({ email, password, csrfToken: "" });

        if (response.status === 200) {
          setUser(response.data);
          localStorage.setItem("authToken", response.headers["authorization"]);
        }
      } else {
        const response = await LoginApi({ email, password, csrfToken });

        if (response.status === 200) {
          setUser(response.data);
          localStorage.setItem("authToken", response.headers["authorization"]);
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        setError("Invalid credentials");
      } else if (axios.isAxiosError(error) && error.response && error.response.headers["dspace-xsrf-token"]) {
        csrfToken = error.response.headers["dspace-xsrf-token"];
        localStorage.setItem("csrfToken", csrfToken);

        try {
          const response = await LoginApi({ email, password, csrfToken });

          if (response.status === 200) {
            setUser(response.data);
            localStorage.setItem("authToken", response.headers["authorization"]);
          }
        } catch (innerError) {
          if (axios.isAxiosError(innerError) && innerError.response && innerError.response.status === 401) {
            setError("Invalid credentials");
          } else {
            console.log(innerError);
            setError("An error occurred. Please try again.");
          }
        }
      } else {
        console.log(error);
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  
    // logout
  const logout = () => {};
    
  

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
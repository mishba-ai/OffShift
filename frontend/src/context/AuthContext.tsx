import {  useState, useEffect, type ReactNode } from "react";
import type {  User } from "@/types";
import { AuthContext } from "./authContextValue";

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [authState, setAuthState] = useState<{
    token: string | null;
    user: User | null;
    isLoading: boolean;
  }>({ token: null, user: null, isLoading: true });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    setAuthState({
      token: storedToken,
      user: storedUser ? JSON.parse(storedUser) : null,
      isLoading: false,
    });
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setAuthState({ token: newToken, user: newUser, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthState({ token: null, user: null, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ user: authState.user, token: authState.token, login, logout, isLoading: authState.isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};


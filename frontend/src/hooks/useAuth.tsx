import { AuthContext } from "@/context/authContextValue";
import { useContext } from "react";


export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
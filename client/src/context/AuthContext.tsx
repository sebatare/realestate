"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useGetAuthUserQuery } from "@/state/api";

// Crear context para compartir auth user
type AuthContextType = ReturnType<typeof useGetAuthUserQuery>;

export const AuthUserContext = createContext<AuthContextType | null>(null);

// Provider que envuelve la app
export function AuthUserProvider({ children }: { children: ReactNode }) {
  const authQuery = useGetAuthUserQuery();

  return (
    <AuthUserContext.Provider value={authQuery}>
      {children}
    </AuthUserContext.Provider>
  );
}

// Hook para consumir el context
export function useAuthUser() {
  const context = useContext(AuthUserContext);
  if (!context) {
    throw new Error("useAuthUser must be used within AuthUserProvider");
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from "react";

interface SelectedSheet {
  id: string;
  name: string;
  modifiedTime: string;
}

export interface AuthState {
  accessToken: string;
  scope: string;
  name?: string;
  email?: string;
}

interface SheetContextType {
  selectedSheet: SelectedSheet | null;
  setSelectedSheet: (sheet: SelectedSheet | null) => void;
  isSheetSelected: boolean;
  auth: AuthState | null;
  setAuth: (auth: AuthState | null) => void;
  isAuthenticated: boolean;
}

const SheetContext = createContext<SheetContextType | undefined>(undefined);

export function SheetProvider({ children }: { children: React.ReactNode }) {
  const [selectedSheet, setSelectedSheet] = useState<SelectedSheet | null>(null);
  const [auth, setAuth] = useState<AuthState | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("selectedSheet");
    if (stored) {
      try {
        setSelectedSheet(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse stored sheet:", error);
      }
    }
    const storedAuth = localStorage.getItem("googleAuth");
    if (storedAuth) {
      try {
        setAuth(JSON.parse(storedAuth));
      } catch (error) {
        console.error("Failed to parse stored auth:", error);
      }
    }
  }, []);

  // Save to localStorage when selected sheet changes
  useEffect(() => {
    if (selectedSheet) {
      localStorage.setItem("selectedSheet", JSON.stringify(selectedSheet));
    } else {
      localStorage.removeItem("selectedSheet");
    }
  }, [selectedSheet]);

  // Save auth to localStorage
  useEffect(() => {
    if (auth) {
      localStorage.setItem("googleAuth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("googleAuth");
    }
  }, [auth]);

  return (
    <SheetContext.Provider
      value={{
        selectedSheet,
        setSelectedSheet,
        isSheetSelected: !!selectedSheet,
        auth,
        setAuth,
        isAuthenticated: !!auth,
      }}
    >
      {children}
    </SheetContext.Provider>
  );
}

export function useSheet() {
  const context = useContext(SheetContext);
  if (context === undefined) {
    throw new Error("useSheet must be used within a SheetProvider");
  }
  return context;
}

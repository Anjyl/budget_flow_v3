import React, { createContext, useContext, useState, useEffect } from "react";

interface SelectedSheet {
  id: string;
  name: string;
  modifiedTime: string;
}

interface SheetContextType {
  selectedSheet: SelectedSheet | null;
  setSelectedSheet: (sheet: SelectedSheet | null) => void;
  isSheetSelected: boolean;
}

const SheetContext = createContext<SheetContextType | undefined>(undefined);

export function SheetProvider({ children }: { children: React.ReactNode }) {
  const [selectedSheet, setSelectedSheet] = useState<SelectedSheet | null>(null);

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
  }, []);

  // Save to localStorage when selected sheet changes
  useEffect(() => {
    if (selectedSheet) {
      localStorage.setItem("selectedSheet", JSON.stringify(selectedSheet));
    } else {
      localStorage.removeItem("selectedSheet");
    }
  }, [selectedSheet]);

  return (
    <SheetContext.Provider
      value={{
        selectedSheet,
        setSelectedSheet,
        isSheetSelected: !!selectedSheet,
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

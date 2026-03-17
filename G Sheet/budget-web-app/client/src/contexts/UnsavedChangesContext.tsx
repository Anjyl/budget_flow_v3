import React, { createContext, useContext, useState, useCallback } from "react";

interface UnsavedChangesContextType {
  /**
   * Whether there are unsaved changes
   */
  hasUnsavedChanges: boolean;

  /**
   * Set whether there are unsaved changes
   */
  setHasUnsavedChanges: (hasChanges: boolean) => void;

  /**
   * Register a save callback
   */
  registerSaveCallback: (callback: () => Promise<void>) => void;

  /**
   * Unregister a save callback
   */
  unregisterSaveCallback: () => void;

  /**
   * Execute the registered save callback
   */
  executeSave: () => Promise<void>;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(
  undefined
);

export function UnsavedChangesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveCallback, setSaveCallback] = useState<(() => Promise<void>) | null>(
    null
  );

  const registerSaveCallback = useCallback((callback: () => Promise<void>) => {
    setSaveCallback(() => callback);
  }, []);

  const unregisterSaveCallback = useCallback(() => {
    setSaveCallback(null);
  }, []);

  const executeSave = useCallback(async () => {
    if (saveCallback) {
      await saveCallback();
    }
  }, [saveCallback]);

  return (
    <UnsavedChangesContext.Provider
      value={{
        hasUnsavedChanges,
        setHasUnsavedChanges,
        registerSaveCallback,
        unregisterSaveCallback,
        executeSave,
      }}
    >
      {children}
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  const context = useContext(UnsavedChangesContext);
  if (!context) {
    throw new Error(
      "useUnsavedChanges must be used within UnsavedChangesProvider"
    );
  }
  return context;
}

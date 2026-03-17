import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";

/**
 * Hook to manage navigation history and provide back button functionality
 */
export function useNavigation() {
  const [location, setLocation] = useLocation();
  const [history, setHistory] = useState<string[]>([]);
  const [canGoBack, setCanGoBack] = useState(false);

  // Track location changes in history
  useEffect(() => {
    setHistory((prev) => {
      // Avoid duplicate consecutive entries
      if (prev[prev.length - 1] === location) {
        return prev;
      }
      return [...prev, location];
    });
  }, [location]);

  // Update canGoBack based on history length
  useEffect(() => {
    setCanGoBack(history.length > 1);
  }, [history]);

  const goBack = useCallback(() => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // Remove current location
      const previousLocation = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setLocation(previousLocation);
    }
  }, [history, setLocation]);

  const goToDashboard = useCallback(() => {
    setHistory([location]); // Reset history
    setLocation("/");
  }, [location, setLocation]);

  return {
    currentLocation: location,
    canGoBack,
    goBack,
    goToDashboard,
    history,
  };
}

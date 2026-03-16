import { useSheet } from "@/contexts/SheetContext";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSheetSelected } = useSheet();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isSheetSelected) {
      navigate("/choose-file");
    }
  }, [isSheetSelected, navigate]);

  if (!isSheetSelected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

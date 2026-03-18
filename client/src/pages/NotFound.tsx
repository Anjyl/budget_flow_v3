import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { AIAssistantWidget } from "@/components/AIAssistantWidget";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const [showAI, setShowAI] = useState(false);

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 relative">
      {showAI && (
        <AIAssistantWidget
          title="Help Assistant"
          systemPrompt="The user is lost on a 404 page. Help them find their way back to the dashboard or other parts of the application."
          suggestedPrompts={[
            "Where am I?",
            "Go to Dashboard",
            "How do I get help?",
          ]}
          height="400px"
          isFloating={true}
          onClose={() => setShowAI(false)}
        />
      )}
      {!showAI && (
        <button
          onClick={() => setShowAI(true)}
          className="fixed bottom-4 right-4 z-40 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all hover:shadow-xl"
          title="Open AI Assistant"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}
      <Card className="w-full max-w-lg mx-4 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse" />
              <AlertCircle className="relative h-16 w-16 text-red-500" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>

          <h2 className="text-xl font-semibold text-slate-700 mb-4">
            Page Not Found
          </h2>

          <p className="text-slate-600 mb-8 leading-relaxed">
            Sorry, the page you are looking for doesn't exist.
            <br />
            It may have been moved or deleted.
          </p>

          <div
            id="not-found-button-group"
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              onClick={handleGoHome}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

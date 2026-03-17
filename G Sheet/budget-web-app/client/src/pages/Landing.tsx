import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { BarChart3, ArrowRight, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { AIAssistantWidget } from "@/components/AIAssistantWidget";

export default function Landing() {
  const { isAuthenticated, logout } = useAuth();
  const [showAI, setShowAI] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden flex flex-col items-center justify-center relative">
      {showAI && (
        <AIAssistantWidget
          title="Welcome Assistant"
          systemPrompt="You are a friendly assistant welcoming the user to BudgetFlow. Explain that BudgetFlow helps them manage their finances by connecting to their Google Sheets."
          suggestedPrompts={[
            "What is BudgetFlow?",
            "How do I get started?",
            "Is my data secure?",
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
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <BarChart3 className="h-12 w-12 text-blue-400" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            BudgetFlow
          </h1>
        </div>

        {/* Main heading */}
        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Master Your <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Finances</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-md mx-auto">
            Connect your Google Sheets and manage your budget with powerful analytics
          </p>
        </div>

        {/* Login/Logout Button */}
        <div className="pt-8 flex flex-col gap-4 items-center">
          {isAuthenticated ? (
            <Button
              onClick={handleLogout}
              size="lg"
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 gap-2 text-lg px-12 py-7"
            >
              Sign Out <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 gap-2 text-lg px-12 py-7"
            >
              Sign In with Google <ArrowRight className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Features hint */}
        <div className="pt-12 text-sm text-slate-400">
          <p>After signing in, select a Google Sheet to get started</p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

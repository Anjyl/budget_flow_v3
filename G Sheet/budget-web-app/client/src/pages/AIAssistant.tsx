import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import AIChatBox, { type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, MessageSquare, TrendingUp, HelpCircle } from "lucide-react";

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm your AI financial assistant. I can help you with:\n\n• **Budget Analysis** - Understanding your spending patterns\n• **Financial Tips** - Personalized advice for saving money\n• **Transaction Help** - Categorizing and analyzing expenses\n• **Goal Setting** - Planning your financial objectives\n• **General Finance** - Answering questions about money management\n\nWhat would you like to know about your finances?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const chatMutation = trpc.ai.chat.useMutation();

  const handleSendMessage = async (content: string) => {
    // Add user message
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const result = await chatMutation.mutateAsync({
        messages: newMessages,
      });

      // Add AI response
      const aiResponse = result.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
      setMessages([
        ...newMessages,
        { role: "assistant", content: aiResponse },
      ]);
    } catch (error) {
      console.error("AI chat error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedPrompts = [
    "Analyze my spending patterns this month",
    "How can I save more money?",
    "Help me create a budget",
    "What's my biggest expense category?",
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">AI Financial Assistant</h1>
            <p className="text-muted-foreground">
              Get personalized financial advice and insights powered by AI
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Spending Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleSendMessage("Analyze my spending patterns")}
              >
                Analyze spending
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-blue-500" />
                Budget Help
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleSendMessage("Help me create a budget")}
              >
                Create budget
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-500" />
                Savings Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleSendMessage("How can I save more money?")}
              >
                Savings advice
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-500" />
                Goal Setting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleSendMessage("Help me set financial goals")}
              >
                Set goals
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* AI Chat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Chat with AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AIChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              placeholder="Ask me anything about your finances..."
              suggestedPrompts={suggestedPrompts}
              height="500px"
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
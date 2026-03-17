import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { Sparkles, X, Minus, Maximize2 } from "lucide-react";

interface AIAssistantWidgetProps {
  /**
   * Title for the widget
   */
  title?: string;

  /**
   * Initial system prompt or context
   */
  systemPrompt?: string;

  /**
   * Suggested prompts to display
   */
  suggestedPrompts?: string[];

  /**
   * Height of the chat box
   */
  height?: string | number;

  /**
   * Whether to show the widget in a modal/floating style
   */
  isFloating?: boolean;

  /**
   * Callback when close button is clicked (for floating widget)
   */
  onClose?: () => void;

  /**
   * Custom className
   */
  className?: string;
}

export function AIAssistantWidget({
  title = "AI Assistant",
  systemPrompt = "You are a helpful financial assistant. Help the user with their budget and financial questions.",
  suggestedPrompts = [
    "Analyze my spending",
    "Budget tips",
    "Financial advice",
  ],
  height = "500px",
  isFloating = false,
  onClose,
  className = "",
}: AIAssistantWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "assistant",
      content: `👋 Hi! I'm your AI financial assistant. How can I help you today?`,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const chatMutation = trpc.ai.chat.useMutation();

  const handleSendMessage = async (content: string) => {
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

      const aiResponse =
        result.choices[0]?.message?.content ||
        "Sorry, I couldn't generate a response.";
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
          content:
            "Sorry, I'm having trouble connecting right now. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <Card className={`${className} ${isMinimized ? "w-auto" : ""}`}>
      <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${isMinimized ? "p-3" : "pb-4"}`}>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          {!isMinimized && title}
        </CardTitle>
        <div className="flex items-center gap-1">
          {isFloating && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8"
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
            </Button>
          )}
          {isFloating && onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      {!isMinimized && (
        <CardContent>
          <AIChatBox
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Ask me anything..."
            suggestedPrompts={suggestedPrompts}
            height={height}
          />
        </CardContent>
      )}
    </Card>
  );

  if (isFloating) {
    return (
      <div className={`fixed bottom-4 right-4 ${isMinimized ? "w-auto" : "w-96"} max-w-[calc(100vw-2rem)] z-50 shadow-2xl rounded-lg transition-all duration-300`}>
        {content}
      </div>
    );
  }

  return content;
}

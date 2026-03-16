import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { invokeLLM, type Message } from "../llm";

export const aiRouter = router({
  chat: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["system", "user", "assistant"]),
            content: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const { messages } = input;

      // Add a system prompt to make the AI helpful for budget management
      const systemMessage: Message = {
        role: "system",
        content: `You are a helpful AI assistant for a budget tracking application called BudgetFlow. You help users with:

1. **Budget Analysis**: Analyzing spending patterns, identifying trends, and providing insights
2. **Financial Advice**: Offering personalized tips for saving money and managing expenses
3. **Transaction Help**: Assisting with categorizing transactions and understanding spending
4. **Goal Setting**: Helping users set and track financial goals
5. **General Finance**: Answering questions about personal finance, investing, and money management

Always be friendly, helpful, and encouraging. Use the context of their budget data when relevant. Keep responses concise but informative.

The user is currently using BudgetFlow, which connects to Google Sheets for budget tracking.`,
      };

      const messagesWithSystem = [systemMessage, ...messages];

      const result = await invokeLLM({
        messages: messagesWithSystem,
        maxTokens: 1000,
      });

      return result;
    }),
});
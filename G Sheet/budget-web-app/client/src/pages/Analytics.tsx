import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatCurrency, getCurrentMonth } from "@/lib/utils";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Sparkles } from "lucide-react";
import { AIAssistantWidget } from "@/components/AIAssistantWidget";

const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E2"];

export default function Analytics() {
  const [showAI, setShowAI] = useState(false);
  const currentMonth = getCurrentMonth();
  const { data: transactions = [] } = trpc.transactions.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: monthlySummary = [] } = trpc.summary.monthly.useQuery({ month: currentMonth });

  // Calculate spending by category
  const spendingByCategory = useMemo(() => {
    const categoryMap = new Map<number, { name: string; amount: number; color: string }>();

    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const category = categories.find((c) => c.id === t.categoryId);
        if (category) {
          const existing = categoryMap.get(t.categoryId) || {
            name: category.name,
            amount: 0,
            color: category.color,
          };
          existing.amount += t.amount;
          categoryMap.set(t.categoryId, existing);
        }
      });

    return Array.from(categoryMap.values()).map((item) => ({
      ...item,
      displayAmount: formatCurrency(item.amount),
    }));
  }, [transactions, categories]);

  // Calculate monthly trends (last 6 months)
  const monthlyTrends = useMemo(() => {
    const trends: { month: string; income: number; expenses: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const monthTransactions = transactions.filter((t) => {
        const tMonth = new Date(t.date).toISOString().slice(0, 7);
        return tMonth === month;
      });

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      trends.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        income: income / 100,
        expenses: expenses / 100,
      });
    }

    return trends;
  }, [transactions]);

  // Calculate category percentages
  const totalExpenses = spendingByCategory.reduce((sum, cat) => sum + cat.amount, 0);
  const categoryPercentages = spendingByCategory.map((cat) => ({
    ...cat,
    percentage: totalExpenses > 0 ? ((cat.amount / totalExpenses) * 100).toFixed(1) : "0",
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 relative">
        {showAI && (
          <AIAssistantWidget
            title="Analytics Assistant"
            systemPrompt="You are a financial analyst helping users understand their spending patterns and financial trends. Provide insights from their analytics data and suggest improvements."
            suggestedPrompts={[
              "Analyze my spending trends",
              "Which category am I overspending on?",
              "How can I improve my finances?",
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

        <h1 className="text-3xl font-bold">Analytics & Reports</h1>

        {/* Expense Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {spendingByCategory.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No expense data available for this month
              </div>
            ) : (
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={spendingByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${((name as any).amount / totalExpenses * 100).toFixed(1)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {spendingByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Category Breakdown Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-semibold">Category</th>
                        <th className="text-right py-2 px-4 font-semibold">Amount</th>
                        <th className="text-right py-2 px-4 font-semibold">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryPercentages.map((cat) => (
                        <tr key={cat.name} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                              {cat.name}
                            </div>
                          </td>
                          <td className="text-right py-2 px-4 font-semibold">{cat.displayAmount}</td>
                          <td className="text-right py-2 px-4">{cat.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trends Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `R${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="income" fill="#10B981" name="Income" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. per Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {spendingByCategory.length > 0
                  ? formatCurrency(totalExpenses / spendingByCategory.length)
                  : "R0.00"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Average spending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{spendingByCategory.length}</div>
              <p className="text-xs text-muted-foreground mt-1">With expenses</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

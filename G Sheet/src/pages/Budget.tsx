import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSheet } from "@/contexts/SheetContext";
import { fetchSheetAsTable } from "@/lib/googleApis";
import { parseBudgetFromSnapshot, type BudgetRow } from "@/lib/sheetUtils";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Budget() {
  const { selectedSheet, auth } = useSheet();
  const [budgets, setBudgets] = useState<BudgetRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedSheet && auth) {
      loadBudgets();
    }
  }, [selectedSheet, auth]);

  const loadBudgets = async () => {
    if (!selectedSheet || !auth) return;

    try {
      setLoading(true);
      const snapshot = await fetchSheetAsTable({ spreadsheetId: selectedSheet.id, sheetTitle: "Budget" });
      const budgetData = parseBudgetFromSnapshot(snapshot);
      setBudgets(budgetData);
    } catch (error) {
      console.error("Failed to load budgets:", error);
      toast.error("Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusIcon = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (percentage >= 80) return <TrendingUp className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-green-500" />;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="w-8 h-8 border-4 border-primary border-t-primary/50 rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground mt-4">Loading budgets...</p>
        </div>
      </div>
    );
  }

  const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = budgets.reduce((sum, b) => sum + b.remaining, 0);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Budget Overview</h1>
        <Badge variant="outline" className="text-sm">
          {budgets.length} categories
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalLimit)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              {totalLimit > 0 ? `${((totalSpent / totalLimit) * 100).toFixed(1)}% of budget` : "0% of budget"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRemaining)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Budget Categories</h2>

        {budgets.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Budget Data Found</h3>
              <p className="text-muted-foreground">
                Make sure your Google Sheet has a "Budget" sheet with columns: Category, Limit, Spent, Remaining
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {budgets.map((budget) => {
              const percentage = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
              const isOverBudget = percentage >= 100;

              return (
                <Card key={budget.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{budget.category}</CardTitle>
                      {getStatusIcon(budget.spent, budget.limit)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Spent: {formatCurrency(budget.spent)}</span>
                      <span>Limit: {formatCurrency(budget.limit)}</span>
                    </div>

                    <Progress
                      value={Math.min(percentage, 100)}
                      className="h-2"
                    />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}% used
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Remaining: {formatCurrency(budget.remaining)}
                        </div>
                        {isOverBudget && (
                          <div className="text-xs text-red-500">
                            Over budget by {formatCurrency(budget.spent - budget.limit)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
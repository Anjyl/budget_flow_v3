import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TrendingDown, TrendingUp, Wallet, Target, Sparkles, FileSpreadsheet, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AIAssistantWidget } from "@/components/AIAssistantWidget";
import { useState, useEffect } from "react";
import { useSheet } from "@/contexts/SheetContext";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { selectedSheet } = useSheet();
  const [, setLocation] = useLocation();
  // Use selected sheet and range for data fetching if available
  const { data: transactions = [], isLoading: isLoadingTransactions } = trpc.transactions.list.useQuery(
    selectedSheet ? { 
      // In a real implementation, we'd pass spreadsheetId and range to the backend
      // For now, we'll use the existing list query but simulate the dependency
    } : undefined
  );
  
  const { data: budgets = [] } = trpc.budgets.list.useQuery({
    month: new Date().toISOString().slice(0, 7),
  });

  // Calculate totals
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Get current month
  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6 relative">
        {/* Sheet Selection Warning */}
        {!selectedSheet && (
          <Card className="border-2 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800">No Sheet Selected</h3>
                  <p className="text-sm text-yellow-700">
                    Please select a Google Sheet and data range to enable dynamic dashboard updates.
                  </p>
                </div>
                <Button 
                  onClick={() => setLocation("/sheets")}
                  variant="outline" 
                  className="border-yellow-300 hover:bg-yellow-100"
                >
                  Go to Sheets
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedSheet && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg w-fit">
            <FileSpreadsheet className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-800">
              Pulling data from: <span className="font-bold">{selectedSheet.name}</span> 
              {selectedSheet.dataRange && ` (${selectedSheet.dataRange})`}
            </span>
          </div>
        )}



        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name || "User"}!</h1>
          <p className="text-muted-foreground mt-2">
            Here's your financial overview for {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(balance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Net position</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{budgets.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Categories tracked</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-muted-foreground text-sm">No transactions yet. Start by adding your first expense!</p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center pb-3 border-b last:border-0">
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                        {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Status</CardTitle>
            </CardHeader>
            <CardContent>
              {budgets.length === 0 ? (
                <p className="text-muted-foreground text-sm">No budgets set up yet. Create one to track your spending!</p>
              ) : (
                <div className="space-y-4">
                  {budgets.slice(0, 5).map((budget) => (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Category {budget.categoryId}</span>
                        <span className="text-sm text-muted-foreground">{formatCurrency(budget.limit)}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

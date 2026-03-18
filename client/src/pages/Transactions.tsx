import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { formatCurrency, parseCurrency, formatDate } from "@/lib/utils";
import { Trash2, Edit2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AIAssistantWidget } from "@/components/AIAssistantWidget";

export default function Transactions() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
    type: "expense" as "expense" | "income",
  });

  const { data: transactions = [], refetch: refetchTransactions } = trpc.transactions.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();

  const createMutation = trpc.transactions.create.useMutation({
    onSuccess: () => {
      toast.success("Transaction added successfully");
      refetchTransactions();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add transaction");
    },
  });

  const updateMutation = trpc.transactions.update.useMutation({
    onSuccess: () => {
      toast.success("Transaction updated successfully");
      refetchTransactions();
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update transaction");
    },
  });

  const deleteMutation = trpc.transactions.delete.useMutation({
    onSuccess: () => {
      toast.success("Transaction deleted successfully");
      refetchTransactions();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete transaction");
    },
  });

  const resetForm = () => {
    setFormData({
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      categoryId: "",
      type: "expense",
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amount = parseCurrency(formData.amount);
    const payload = {
      amount,
      description: formData.description,
      date: new Date(formData.date),
      categoryId: parseInt(formData.categoryId),
      type: formData.type,
    };

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (transaction: any) => {
    setFormData({
      amount: (transaction.amount / 100).toFixed(2),
      description: transaction.description || "",
      date: new Date(transaction.date).toISOString().split("T")[0],
      categoryId: transaction.categoryId.toString(),
      type: transaction.type,
    });
    setEditingId(transaction.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 relative">


        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Transactions</h1>
          <Button onClick={() => setIsFormOpen(!isFormOpen)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        {/* Transaction Form */}
        {isFormOpen && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Edit Transaction" : "New Transaction"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as "expense" | "income" })}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Optional description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? "Update" : "Add"} Transaction
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No transactions yet. Add one to get started!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Description</th>
                      <th className="text-left py-3 px-4 font-semibold">Category</th>
                      <th className="text-right py-3 px-4 font-semibold">Amount</th>
                      <th className="text-center py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{formatDate(new Date(transaction.date))}</td>
                        <td className="py-3 px-4">{transaction.description || "-"}</td>
                        <td className="py-3 px-4">
                          {categories.find((c) => c.id === transaction.categoryId)?.name || "Unknown"}
                        </td>
                        <td className={`py-3 px-4 text-right font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(transaction)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(transaction.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

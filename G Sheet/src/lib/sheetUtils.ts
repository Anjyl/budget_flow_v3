import type { SheetSnapshot } from "@/lib/googleApis";

export type TransactionRow = {
  id: string;
  type: "income" | "expense";
  amount: number;
  date: string;
  description?: string;
  category?: string;
};

export type BudgetRow = {
  id: string;
  category: string;
  limit: number; // in cents
  spent: number; // in cents
  remaining: number; // in cents
};

export function parseTransactionsFromSnapshot(snapshot: SheetSnapshot): TransactionRow[] {
  const headers = snapshot.headers.map((h) => h?.toString().toLowerCase().trim() ?? "");

  const idxType = headers.findIndex((h) => ["type", "transaction type"].some((k) => h.includes(k)));
  const idxAmount = headers.findIndex((h) => ["amount", "value"].some((k) => h.includes(k)));
  const idxDate = headers.findIndex((h) => ["date"].some((k) => h.includes(k)));
  const idxDescription = headers.findIndex((h) => ["description", "desc"].some((k) => h.includes(k)));
  const idxCategory = headers.findIndex((h) => ["category"].some((k) => h.includes(k)));

  if (idxType === -1 || idxAmount === -1 || idxDate === -1) {
    return [];
  }

  return snapshot.rows
    .map((row, rowIndex) => {
      const typeRaw = row[idxType]?.toString().toLowerCase().trim() ?? "";
      const type = (typeRaw.includes("inc") ? "income" : typeRaw.includes("exp") ? "expense" : "expense") as TransactionRow["type"];      const amountRaw = row[idxAmount]?.toString().replace(/[^0-9.-]/g, "") ?? "0";
      const amount = Math.round(parseFloat(amountRaw) * 100);
      const date = row[idxDate]?.toString() ?? "";
      const description = idxDescription >= 0 ? row[idxDescription]?.toString() : "";
      const category = idxCategory >= 0 ? row[idxCategory]?.toString() : "";

      return {
        id: `${snapshot.sheetTitle}-${rowIndex}`,
        type,
        amount,
        date,
        description,
        category,
      };
    })
    .filter((t) => Boolean(t.date) && !Number.isNaN(t.amount));
}

export function parseBudgetFromSnapshot(snapshot: SheetSnapshot): BudgetRow[] {
  const headers = snapshot.headers.map((h) => h?.toString().toLowerCase().trim() ?? "");

  const idxCategory = headers.findIndex((h) => ["category", "categories"].some((k) => h.includes(k)));
  const idxLimit = headers.findIndex((h) => ["limit", "budget", "planned"].some((k) => h.includes(k)));
  const idxSpent = headers.findIndex((h) => ["spent", "actual", "used"].some((k) => h.includes(k)));
  const idxRemaining = headers.findIndex((h) => ["remaining", "left", "available"].some((k) => h.includes(k)));

  if (idxCategory === -1 || idxLimit === -1) {
    return [];
  }

  return snapshot.rows
    .map((row, rowIndex) => {
      const category = row[idxCategory]?.toString().trim() ?? "";
      const limitRaw = row[idxLimit]?.toString().replace(/[^0-9.-]/g, "") ?? "0";
      const limit = Math.round(parseFloat(limitRaw) * 100);
      const spentRaw = idxSpent >= 0 ? row[idxSpent]?.toString().replace(/[^0-9.-]/g, "") ?? "0" : "0";
      const spent = Math.round(parseFloat(spentRaw) * 100);
      const remainingRaw = idxRemaining >= 0 ? row[idxRemaining]?.toString().replace(/[^0-9.-]/g, "") ?? "0" : "0";
      const remaining = Math.round(parseFloat(remainingRaw) * 100);

      return {
        id: `${snapshot.sheetTitle}-${rowIndex}`,
        category,
        limit,
        spent,
        remaining,
      };
    })
    .filter((b) => Boolean(b.category) && !Number.isNaN(b.limit));
}

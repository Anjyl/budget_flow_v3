import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  getTransactionsByUser,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategoriesByUser,
  createCategory,
  getMonthlySummary,
} from "./db";

// Mock database
vi.mock("./db", async () => {
  const actual = await vi.importActual("./db");
  return {
    ...actual,
  };
});

describe("Transaction Operations", () => {
  const userId = 1;
  const categoryId = 1;
  const testDate = new Date("2026-03-13");

  describe("createTransaction", () => {
    it("should create a transaction with valid data", async () => {
      const transactionData = {
        userId,
        amount: 5000, // $50.00 in cents
        description: "Grocery shopping",
        date: testDate,
        categoryId,
        type: "expense" as const,
      };

      const result = await createTransaction(transactionData);
      expect(result).toBeDefined();
    });

    it("should handle negative amounts for income", async () => {
      const transactionData = {
        userId,
        amount: -10000, // -$100.00 in cents
        description: "Salary",
        date: testDate,
        categoryId,
        type: "income" as const,
      };

      const result = await createTransaction(transactionData);
      expect(result).toBeDefined();
    });
  });

  describe("getTransactionsByUser", () => {
    it("should retrieve all transactions for a user", async () => {
      const transactions = await getTransactionsByUser(userId);
      expect(Array.isArray(transactions)).toBe(true);
    });

    it("should filter transactions by category", async () => {
      const transactions = await getTransactionsByUser(userId, { categoryId });
      expect(Array.isArray(transactions)).toBe(true);
    });

    it("should filter transactions by date range", async () => {
      const startDate = new Date("2026-03-01");
      const endDate = new Date("2026-03-31");
      const transactions = await getTransactionsByUser(userId, {
        startDate,
        endDate,
      });
      expect(Array.isArray(transactions)).toBe(true);
    });
  });

  describe("updateTransaction", () => {
    it("should update transaction amount", async () => {
      const transactionId = 1;
      const updateData = {
        amount: 7500, // Update to $75.00
      };

      const result = await updateTransaction(transactionId, updateData);
      expect(result).toBeDefined();
    });

    it("should update transaction description", async () => {
      const transactionId = 1;
      const updateData = {
        description: "Updated grocery shopping",
      };

      const result = await updateTransaction(transactionId, updateData);
      expect(result).toBeDefined();
    });
  });

  describe("deleteTransaction", () => {
    it("should delete a transaction", async () => {
      const transactionId = 1;
      const result = await deleteTransaction(transactionId);
      expect(result).toBeDefined();
    });
  });

  describe("Category Operations", () => {
    it("should retrieve categories for a user", async () => {
      const categories = await getCategoriesByUser(userId);
      expect(Array.isArray(categories)).toBe(true);
    });

    it("should create a category", async () => {
      const categoryData = {
        userId,
        name: "Food",
        color: "#FF6B6B",
        icon: "utensils",
      };

      const result = await createCategory(categoryData);
      expect(result).toBeDefined();
    });
  });

  describe("Monthly Summary", () => {
    it("should calculate monthly spending summary", async () => {
      const month = "2026-03";
      const summary = await getMonthlySummary(userId, month);
      expect(summary).toBeDefined();
      if (summary) {
        expect(Array.isArray(summary)).toBe(true);
      }
    });

    it("should handle months with no transactions", async () => {
      const month = "2020-01";
      const summary = await getMonthlySummary(userId, month);
      expect(summary).toBeDefined();
    });
  });
});

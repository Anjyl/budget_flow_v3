import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories for transaction classification (Food, Transport, Utilities, etc.)
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 64 }).notNull(),
  color: varchar("color", { length: 7 }).default("#3B82F6").notNull(), // Hex color
  icon: varchar("icon", { length: 64 }).default("tag").notNull(), // Lucide icon name
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Individual transactions (expenses/income)
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // Store as cents to avoid floating point issues
  description: text("description"),
  date: timestamp("date").notNull(),
  categoryId: int("categoryId").notNull(),
  type: mysqlEnum("type", ["expense", "income"]).default("expense").notNull(),
  googleSheetsRowId: varchar("googleSheetsRowId", { length: 256 }), // For sync tracking
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Monthly budget limits per category
 */
export const budgets = mysqlTable("budgets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId").notNull(),
  limit: int("limit").notNull(), // Store as cents
  month: varchar("month", { length: 7 }).notNull(), // Format: YYYY-MM
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;

/**
 * Recurring transaction templates (rent, utilities, subscriptions, etc.)
 */
export const recurringTransactions = mysqlTable("recurring_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  templateName: varchar("templateName", { length: 128 }).notNull(),
  amount: int("amount").notNull(), // Store as cents
  categoryId: int("categoryId").notNull(),
  frequency: mysqlEnum("frequency", ["weekly", "biweekly", "monthly", "yearly"]).notNull(),
  nextDueDate: timestamp("nextDueDate").notNull(),
  isActive: int("isActive").default(1).notNull(), // 0 or 1 for MySQL boolean
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RecurringTransaction = typeof recurringTransactions.$inferSelect;
export type InsertRecurringTransaction = typeof recurringTransactions.$inferInsert;

/**
 * Google Sheets sync metadata
 */
export const googleSheetsSyncs = mysqlTable("google_sheets_syncs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  spreadsheetId: varchar("spreadsheetId", { length: 256 }).notNull(),
  sheetName: varchar("sheetName", { length: 256 }).default("Budget").notNull(),
  lastSyncedAt: timestamp("lastSyncedAt"),
  syncStatus: mysqlEnum("syncStatus", ["idle", "syncing", "error"]).default("idle").notNull(),
  lastError: text("lastError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GoogleSheetsSync = typeof googleSheetsSyncs.$inferSelect;
export type InsertGoogleSheetsSync = typeof googleSheetsSyncs.$inferInsert;
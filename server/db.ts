import { and, desc, eq, gte, lte, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, InsertCategory, categories, InsertTransaction, transactions, InsertBudget, budgets, InsertRecurringTransaction, recurringTransactions, InsertGoogleSheetsSync, googleSheetsSyncs } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Transaction queries
export async function getTransactionsByUser(userId: number, filters?: { categoryId?: number; startDate?: Date; endDate?: Date }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(transactions.userId, userId)];
  
  if (filters?.categoryId) {
    conditions.push(eq(transactions.categoryId, filters.categoryId));
  }
  if (filters?.startDate) {
    conditions.push(gte(transactions.date, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(transactions.date, filters.endDate));
  }

  return await db.select().from(transactions).where(and(...conditions)).orderBy(desc(transactions.date));
}

export async function createTransaction(data: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(transactions).values(data);
  return result;
}

export async function updateTransaction(id: number, data: Partial<InsertTransaction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(transactions).set(data).where(eq(transactions.id, id));
}

export async function deleteTransaction(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(transactions).where(eq(transactions.id, id));
}

// Category queries
export async function getCategoriesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(categories).where(eq(categories.userId, userId)).orderBy(categories.name);
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(categories).values(data);
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(categories).where(eq(categories.id, id));
}

// Budget queries
export async function getBudgetsByUser(userId: number, month?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(budgets.userId, userId)];
  if (month) {
    conditions.push(eq(budgets.month, month));
  }
  return await db.select().from(budgets).where(and(...conditions));
}

export async function createBudget(data: InsertBudget) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(budgets).values(data);
}

export async function updateBudget(id: number, data: Partial<InsertBudget>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(budgets).set(data).where(eq(budgets.id, id));
}

export async function deleteBudget(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(budgets).where(eq(budgets.id, id));
}

// Recurring transaction queries
export async function getRecurringTransactionsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(recurringTransactions).where(eq(recurringTransactions.userId, userId)).orderBy(recurringTransactions.templateName);
}

export async function createRecurringTransaction(data: InsertRecurringTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(recurringTransactions).values(data);
}

export async function updateRecurringTransaction(id: number, data: Partial<InsertRecurringTransaction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(recurringTransactions).set(data).where(eq(recurringTransactions.id, id));
}

export async function deleteRecurringTransaction(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(recurringTransactions).where(eq(recurringTransactions.id, id));
}

// Google Sheets sync queries
export async function getGoogleSheetsSync(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(googleSheetsSyncs).where(eq(googleSheetsSyncs.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createGoogleSheetsSync(data: InsertGoogleSheetsSync) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(googleSheetsSyncs).values(data);
}

export async function updateGoogleSheetsSync(userId: number, data: Partial<InsertGoogleSheetsSync>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(googleSheetsSyncs).set(data).where(eq(googleSheetsSyncs.userId, userId));
}

// Budget summary calculations
export async function getMonthlySummary(userId: number, month: string) {
  const db = await getDb();
  if (!db) return null;

  // Parse month string (YYYY-MM) to dates
  const [year, monthNum] = month.split("-").map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 1);

  const monthTransactions = await db
    .select({
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
      categoryIcon: categories.icon,
      total: sql<number>`SUM(${transactions.amount})`.mapWith(Number),
      count: sql<number>`COUNT(*)`.mapWith(Number),
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(
      eq(transactions.userId, userId),
      gte(transactions.date, startDate),
      lt(transactions.date, endDate)
    ))
    .groupBy(transactions.categoryId);

  return monthTransactions;
}

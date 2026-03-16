import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getTransactionsByUser,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategoriesByUser,
  createCategory,
  updateCategory,
  deleteCategory,
  getBudgetsByUser,
  createBudget,
  updateBudget,
  deleteBudget,
  getRecurringTransactionsByUser,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  getMonthlySummary,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Transactions router
  transactions: router({
    list: publicProcedure
      .input(
        z
          .object({
            categoryId: z.number().optional(),
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return [];
        return await getTransactionsByUser(ctx.user.id, input);
      }),

    create: publicProcedure
      .input(
        z.object({
          amount: z.number(),
          description: z.string().optional(),
          date: z.date(),
          categoryId: z.number(),
          type: z.enum(["expense", "income"]).default("expense"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return await createTransaction({ ...input, userId: ctx.user.id });
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            amount: z.number().optional(),
            description: z.string().optional(),
            date: z.date().optional(),
            categoryId: z.number().optional(),
            type: z.enum(["expense", "income"]).optional(),
          }),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return await updateTransaction(input.id, input.data);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return await deleteTransaction(input.id);
      }),
  }),

  // Categories router
  categories: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return await getCategoriesByUser(ctx.user.id);
    }),

    create: publicProcedure
      .input(
        z.object({
          name: z.string(),
          color: z.string().default("#3B82F6"),
          icon: z.string().default("tag"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return await createCategory({ ...input, userId: ctx.user.id });
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            name: z.string().optional(),
            color: z.string().optional(),
            icon: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return await updateCategory(input.id, input.data);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return await deleteCategory(input.id);
      }),
  }),

  // Budgets router
  budgets: router({
    list: publicProcedure
      .input(z.object({ month: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return [];
        return await getBudgetsByUser(ctx.user.id, input?.month);
      }),

    create: publicProcedure
      .input(
        z.object({
          categoryId: z.number(),
          limit: z.number(),
          month: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return await createBudget({ ...input, userId: ctx.user.id });
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            categoryId: z.number().optional(),
            limit: z.number().optional(),
            month: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return await updateBudget(input.id, input.data);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return await deleteBudget(input.id);
      }),
  }),

  // Recurring transactions router
  recurringTransactions: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      return await getRecurringTransactionsByUser(ctx.user.id);
    }),

    create: publicProcedure
      .input(
        z.object({
          templateName: z.string(),
          amount: z.number(),
          categoryId: z.number(),
          frequency: z.enum(["weekly", "biweekly", "monthly", "yearly"]),
          nextDueDate: z.date(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return await createRecurringTransaction({ ...input, userId: ctx.user.id, isActive: 1 });
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            templateName: z.string().optional(),
            amount: z.number().optional(),
            categoryId: z.number().optional(),
            frequency: z.enum(["weekly", "biweekly", "monthly", "yearly"]).optional(),
            nextDueDate: z.date().optional(),
            isActive: z.number().optional(),
          }),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return await updateRecurringTransaction(input.id, input.data);
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return await deleteRecurringTransaction(input.id);
      }),
  }),

  // Summary and analytics router
  summary: router({
    monthly: publicProcedure
      .input(z.object({ month: z.string() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return null;
        return await getMonthlySummary(ctx.user.id, input.month);
      }),
  }),
});

export type AppRouter = typeof appRouter;

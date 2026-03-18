import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { listSpreadsheets, getSheetMetadata, readSheetData } from "./googleSheets";
import { getDb } from "./db";

/**
 * Google Drive and Sheets router
 * Handles listing files, selecting sheets, and syncing data
 */
export const googleDriveRouter = router({
  /**
   * List user's Google Drive spreadsheets
   */
  listSpreadsheets: protectedProcedure.query(async ({ ctx }) => {
    try {
      // TODO: Get Google access token from session/database
      // For now, this is a placeholder
      const accessToken = "";
      if (!accessToken) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Google access token not found. Please re-authenticate.",
        });
      }

      const files = await listSpreadsheets(accessToken);
      return files.map((file: any) => ({
        id: file.id,
        name: file.name,
        modifiedTime: file.modifiedTime,
        owners: file.owners,
        webViewLink: file.webViewLink,
      }));
    } catch (error) {
      console.error("Error listing spreadsheets:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list spreadsheets",
      });
    }
  }),

  /**
   * Get sheets from a specific spreadsheet
   */
  getSheets: protectedProcedure
    .input(z.object({ spreadsheetId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Get Google access token from session/database
        const accessToken = "";
        if (!accessToken) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Google access token not found.",
          });
        }

        const sheets = await getSheetMetadata(
          accessToken,
          input.spreadsheetId
        );

        return sheets.map((sheet: any) => ({
          id: sheet.properties?.sheetId,
          title: sheet.properties?.title,
          index: sheet.properties?.index,
          gridProperties: sheet.properties?.gridProperties,
        }));
      } catch (error) {
        console.error("Error getting sheets:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get sheets",
        });
      }
    }),

  /**
   * Select a spreadsheet for the user
   */
  selectSpreadsheet: protectedProcedure
    .input(
      z.object({
        spreadsheetId: z.string(),
        spreadsheetName: z.string(),
        modifiedTime: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database not available",
          });
        }

        // TODO: Store selected spreadsheet in database
        // This will be linked to the user's account
        return {
          success: true,
          spreadsheetId: input.spreadsheetId,
          spreadsheetName: input.spreadsheetName,
          userId: ctx.user.id,
        };
      } catch (error) {
        console.error("Error selecting spreadsheet:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to select spreadsheet",
        });
      }
    }),

  /**
   * Read data from a specific sheet
   */
  readSheet: protectedProcedure
    .input(
      z.object({
        spreadsheetId: z.string(),
        sheetName: z.string(),
        range: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // TODO: Get Google access token from session/database
        const accessToken = "";
        if (!accessToken) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Google access token not found.",
          });
        }

        const data = await readSheetData(
          accessToken,
          input.spreadsheetId,
          input.sheetName,
          input.range || "A1:Z1000"
        );

        return data;
      } catch (error) {
        console.error("Error reading sheet:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to read sheet data",
        });
      }
    }),

  /**
   * Get user's currently selected spreadsheet
   */
  getSelectedSpreadsheet: protectedProcedure.query(async ({ ctx }) => {
    try {
      // TODO: Retrieve from database
      return null;
    } catch (error) {
      console.error("Error getting selected spreadsheet:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get selected spreadsheet",
      });
    }
  }),
});

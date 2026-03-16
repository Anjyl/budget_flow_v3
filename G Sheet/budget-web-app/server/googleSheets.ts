import { google } from "googleapis";
import { ENV } from "./_core/env";

/**
 * Initialize OAuth2 client for Google APIs
 * @param accessToken User's Google OAuth access token
 */
export function getOAuth2Client(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    ENV.googleClientId,
    ENV.googleClientSecret,
    `${process.env.VITE_FRONTEND_FORGE_API_URL || "http://localhost:3000"}/api/oauth/google/callback`
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return oauth2Client;
}

/**
 * List user's Google Drive spreadsheets
 */
export async function listSpreadsheets(accessToken: string) {
  try {
    const auth = getOAuth2Client(accessToken);
    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
      spaces: "drive",
      fields: "files(id, name, modifiedTime, owners, webViewLink)",
      pageSize: 50,
    });

    return response.data.files || [];
  } catch (error) {
    console.error("Error listing spreadsheets:", error);
    throw new Error("Failed to list spreadsheets");
  }
}

/**
 * Get all sheets from a spreadsheet
 */
export async function getSheetMetadata(accessToken: string, spreadsheetId: string) {
  try {
    const auth = getOAuth2Client(accessToken);
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets(properties(sheetId,title,index,gridProperties))",
    });

    return response.data.sheets || [];
  } catch (error) {
    console.error("Error getting sheet metadata:", error);
    throw new Error("Failed to get sheet metadata");
  }
}

/**
 * Read data from a specific sheet
 */
export async function readSheetData(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  range: string = "A1:Z1000"
) {
  try {
    const auth = getOAuth2Client(accessToken);
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!${range}`,
    });

    return {
      values: response.data.values || [],
      range: response.data.range,
    };
  } catch (error) {
    console.error("Error reading sheet data:", error);
    throw new Error("Failed to read sheet data");
  }
}

/**
 * Write data to a specific sheet
 */
export async function writeSheetData(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  range: string,
  values: any[][]
) {
  try {
    const auth = getOAuth2Client(accessToken);
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!${range}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error writing sheet data:", error);
    throw new Error("Failed to write sheet data");
  }
}

/**
 * Clear a range in a sheet
 */
export async function clearSheetRange(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  range: string
) {
  try {
    const auth = getOAuth2Client(accessToken);
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!${range}`,
    });

    return response.data;
  } catch (error) {
    console.error("Error clearing sheet range:", error);
    throw new Error("Failed to clear sheet range");
  }
}

/**
 * Append data to a sheet
 */
export async function appendSheetData(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  values: any[][]
) {
  try {
    const auth = getOAuth2Client(accessToken);
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error appending sheet data:", error);
    throw new Error("Failed to append sheet data");
  }
}

/**
 * Get cell formatting and metadata
 */
export async function getSheetFormatting(
  accessToken: string,
  spreadsheetId: string,
  sheetId: number
) {
  try {
    const auth = getOAuth2Client(accessToken);
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      ranges: [`Sheet!A1:Z1000`],
      fields: "sheets(data(rowData(values(userEnteredFormat,effectiveFormat))))",
    });

    return response.data;
  } catch (error) {
    console.error("Error getting sheet formatting:", error);
    throw new Error("Failed to get sheet formatting");
  }
}

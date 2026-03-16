import { ensureGoogleScripts } from "@/lib/googleAuth";

declare global {
  interface Window {
    gapi?: any;
  }
}

export async function initGapi(apiKey: string) {
  await ensureGoogleScripts();

  await new Promise<void>((resolve) => {
    window.gapi.load("client:picker", () => resolve());
  });

  await window.gapi.client.init({
    apiKey,
    discoveryDocs: [
      "https://sheets.googleapis.com/$discovery/rest?version=v4",
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
    ],
  });
}

export function setGapiToken(accessToken: string) {
  window.gapi.client.setToken({ access_token: accessToken });
}

export type PickedSheet = {
  spreadsheetId: string;
  name: string;
  url: string;
};

export type DriveSheetFile = {
  id: string;
  name: string;
  modifiedTime?: string;
  owners?: string[];
};

export async function listSpreadsheetFiles(args: {
  pageSize?: number;
  query?: string;
}): Promise<DriveSheetFile[]> {
  const qParts: string[] = [
    "mimeType='application/vnd.google-apps.spreadsheet'",
    "trashed=false",
  ];

  // Include shared files by default; Drive search already includes them.
  if (args.query?.trim()) {
    const escaped = args.query.replace(/'/g, "\\'");
    qParts.push(`name contains '${escaped}'`);
  }

  const resp = await window.gapi.client.drive.files.list({
    q: qParts.join(" and "),
    pageSize: args.pageSize ?? 50,
    orderBy: "modifiedTime desc",
    fields: "files(id,name,modifiedTime,owners(displayName))",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    corpora: "user",
  });

  const files = (resp.result?.files ?? []) as any[];
  return files.map((f) => ({
    id: f.id,
    name: f.name,
    modifiedTime: f.modifiedTime,
    owners: (f.owners ?? []).map((o: any) => o.displayName).filter(Boolean),
  }));
}

export async function openGoogleSheetPicker(args: {
  apiKey: string;
  appId: string;
  accessToken: string;
}): Promise<PickedSheet> {
  await initGapi(args.apiKey);
  setGapiToken(args.accessToken);

  return new Promise((resolve, reject) => {
    const google = window.google;
    if (!google?.picker) {
      reject(new Error("Google Picker not available (script not loaded)."));
      return;
    }

    const view = new google.picker.View(google.picker.ViewId.SPREADSHEETS);
    view.setMimeTypes("application/vnd.google-apps.spreadsheet");

    const picker = new google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(args.accessToken)
      .setDeveloperKey(args.apiKey)
      .setAppId(args.appId)
      .setCallback((data: any) => {
        if (data.action === google.picker.Action.CANCEL) {
          reject(new Error("Picker cancelled"));
          return;
        }
        if (data.action !== google.picker.Action.PICKED) return;

        const doc = data.docs?.[0];
        if (!doc?.id) {
          reject(new Error("No file selected"));
          return;
        }

        resolve({
          spreadsheetId: doc.id,
          name: doc.name ?? "(Untitled)",
          url: doc.url ?? "",
        });
      })
      .build();

    picker.setVisible(true);
  });
}

export type SheetSnapshot = {
  spreadsheetId: string;
  spreadsheetTitle: string;
  sheetTitle: string;
  headers: string[];
  headerPlain: boolean[];
  rows: string[][];
  rowPlain: boolean[][];
  colCount: number; // visible, used columns
};

export type SpreadsheetMeta = {
  spreadsheetId: string;
  spreadsheetTitle: string;
  sheetTitles: string[];
};

export async function fetchSpreadsheetMeta(spreadsheetId: string): Promise<SpreadsheetMeta> {
  const meta = await window.gapi.client.sheets.spreadsheets.get({
    spreadsheetId,
    includeGridData: false,
  });

  const spreadsheetTitle = meta.result?.properties?.title ?? "(Untitled Spreadsheet)";
  const sheetTitles = (meta.result?.sheets ?? [])
    .map((s: any) => s?.properties?.title)
    .filter(Boolean);

  return { spreadsheetId, spreadsheetTitle, sheetTitles };
}

function cellEffectiveType(cell: any): "empty" | "string" | "number" | "bool" | "other" {
  const ev = cell?.effectiveValue;
  if (!ev) return "empty";
  if (ev.stringValue !== undefined) return "string";
  if (ev.numberValue !== undefined) return "number";
  if (ev.boolValue !== undefined) return "bool";
  return "other";
}

function isDisplayedZeroZar(s: string) {
  const t = String(s ?? "").trim();
  // Common displays: "ZAR 0.00", "ZAR0.00", "R0.00", "R 0.00"
  return /^(zar\s*0(?:\.00)?|r\s*0(?:\.00)?)$/i.test(t);
}

function gridValueToDisplayString(cell: any): string {
  // Prefer formattedValue because the user asked for "as displayed".
  const fv = cell?.formattedValue;
  if (fv !== undefined && fv !== null) {
    const s = String(fv);
    return isDisplayedZeroZar(s) ? "" : s;
  }

  // Fallbacks
  const ev = cell?.effectiveValue;
  const uev = cell?.userEnteredValue;
  const v = ev ?? uev;
  if (v?.stringValue !== undefined) return String(v.stringValue);
  if (v?.numberValue !== undefined) return String(v.numberValue);
  if (v?.boolValue !== undefined) return String(v.boolValue);
  return "";
}

function buildAlignedMatrixFromGridData(sheet: any): {
  headers: string[];
  headerPlain: boolean[];
  rows: string[][];
  rowPlain: boolean[][];
  colCount: number;
} {
  const data0 = sheet?.data?.[0] ?? {};
  const rowData: any[] = data0?.rowData ?? [];
  const rowMeta: any[] = data0?.rowMetadata ?? [];
  const colMeta: any[] = data0?.columnMetadata ?? [];

  // Determine visible rows/cols (skip hidden)
  const isRowHidden = (r: number) => Boolean(rowMeta[r]?.hiddenByUser);
  const isColHidden = (c: number) => Boolean(colMeta[c]?.hiddenByUser);

  // Find used area based on non-empty displayed values, ignoring hidden rows/cols.
  let lastVisibleRow = -1;
  let lastVisibleCol = -1;

  for (let r = 0; r < rowData.length; r++) {
    if (isRowHidden(r)) continue;
    const values: any[] = rowData[r]?.values ?? [];
    for (let c = 0; c < values.length; c++) {
      if (isColHidden(c)) continue;
      const s = gridValueToDisplayString(values[c]);
      if (s !== "") {
        lastVisibleRow = Math.max(lastVisibleRow, r);
        lastVisibleCol = Math.max(lastVisibleCol, c);
      }
    }
  }

  const maxRow = Math.max(lastVisibleRow + 1, 1);
  const maxCol = Math.max(lastVisibleCol + 1, 1);

  // Build visible index maps
  const visibleRowIdx: number[] = [];
  for (let r = 0; r < maxRow; r++) if (!isRowHidden(r)) visibleRowIdx.push(r);

  const visibleColIdx: number[] = [];
  for (let c = 0; c < maxCol; c++) if (!isColHidden(c)) visibleColIdx.push(c);

  // Remove fully-empty columns (across visible rows)
  const colHasAny: boolean[] = visibleColIdx.map(() => false);
  for (let vr = 0; vr < visibleRowIdx.length; vr++) {
    const r = visibleRowIdx[vr];
    const values: any[] = rowData[r]?.values ?? [];
    for (let vc = 0; vc < visibleColIdx.length; vc++) {
      const c = visibleColIdx[vc];
      const s = gridValueToDisplayString(values[c]);
      if (s !== "") colHasAny[vc] = true;
    }
  }
  const visibleColIdxTrimmed = visibleColIdx.filter((_, i) => colHasAny[i]);

  // Remove fully-empty rows (across trimmed cols)
  const visibleRowIdxTrimmed: number[] = [];
  for (const r of visibleRowIdx) {
    const values: any[] = rowData[r]?.values ?? [];
    const any = visibleColIdxTrimmed.some((c) => gridValueToDisplayString(values[c]) !== "");
    if (any) visibleRowIdxTrimmed.push(r);
  }

  // Ensure at least 1 row/col so UI doesn't crash
  const cols = visibleColIdxTrimmed.length ? visibleColIdxTrimmed : [0];
  const rowsIdx = visibleRowIdxTrimmed.length ? visibleRowIdxTrimmed : [0];

  const matrix: string[][] = [];
  const plain: boolean[][] = [];

  for (const r of rowsIdx) {
    const values: any[] = rowData[r]?.values ?? [];
    const row: string[] = [];
    const rowPlain: boolean[] = [];
    for (const c of cols) {
      const cell = values[c];
      row.push(gridValueToDisplayString(cell));
      rowPlain.push(cellEffectiveType(cell) === "string");
    }
    matrix.push(row);
    plain.push(rowPlain);
  }

  const headers = matrix[0] ?? Array.from({ length: cols.length }, () => "");
  const headerPlain = plain[0] ?? Array.from({ length: cols.length }, () => true);
  const dataRows = matrix.slice(1);
  const rowPlain = plain.slice(1);

  return {
    headers,
    headerPlain,
    rows: dataRows,
    rowPlain,
    colCount: cols.length,
  };
}

export async function fetchSheetAsTable(args: {
  spreadsheetId: string;
  sheetTitle: string;
}): Promise<SheetSnapshot> {
  const meta = await fetchSpreadsheetMeta(args.spreadsheetId);

  // Use grid data to preserve alignment and displayed formatting.
  const resp = await window.gapi.client.sheets.spreadsheets.get({
    spreadsheetId: args.spreadsheetId,
    ranges: [args.sheetTitle],
    includeGridData: true,
    // Restrict fields to reduce payload size.
    fields:
      "properties.title,sheets(properties(title),data(rowMetadata(hiddenByUser),columnMetadata(hiddenByUser),rowData(values(formattedValue,effectiveValue,userEnteredValue))))",
  });

  const sheet = resp.result?.sheets?.[0];

  const { headers, headerPlain, rows, rowPlain, colCount } = buildAlignedMatrixFromGridData(sheet);

  return {
    spreadsheetId: args.spreadsheetId,
    spreadsheetTitle: meta.spreadsheetTitle,
    sheetTitle: args.sheetTitle,
    headers,
    headerPlain,
    rows,
    rowPlain,
    colCount,
  };
}

export async function fetchFirstSheetAsTable(spreadsheetId: string): Promise<SheetSnapshot> {
  const meta = await fetchSpreadsheetMeta(spreadsheetId);
  const first = meta.sheetTitles[0] ?? "Sheet1";
  return fetchSheetAsTable({ spreadsheetId, sheetTitle: first });
}

export async function saveTableBackToSheet(args: {
  spreadsheetId: string;
  sheetTitle: string;
  headers: string[];
  rows: string[][];
}) {
  // Values-only operations; formatting is preserved by Google Sheets.
  // Important: clear first so deleted rows/cols don't leave stale values behind.
  const all = [args.headers, ...args.rows];

  await window.gapi.client.sheets.spreadsheets.values.clear({
    spreadsheetId: args.spreadsheetId,
    range: `${args.sheetTitle}`,
  });

  await window.gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: args.spreadsheetId,
    range: `${args.sheetTitle}!A1`,
    valueInputOption: "USER_ENTERED",
    resource: {
      majorDimension: "ROWS",
      values: all,
    },
  });
}

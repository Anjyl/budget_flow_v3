import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { nanoid } from "nanoid";

import GoogleConnect, { type AuthState } from "@/components/GoogleConnect";
import SheetPicker from "@/components/SheetPicker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import {
  fetchFirstSheetAsTable,
  fetchSheetAsTable,
  fetchSpreadsheetMeta,
  initGapi,
  saveTableBackToSheet,
  setGapiToken,
  type PickedSheet,
  type SheetSnapshot,
  type SpreadsheetMeta,
} from "@/lib/googleApis";

interface HomeProps {
  targetSection?: string;
}

type RowModel = { id: string; cells: string[]; plain: boolean[] };

function normalizeRowLength(row: string[], n: number) {
  const copy = row.slice(0, n);
  while (copy.length < n) copy.push("");
  return copy;
}

function normalizeBoolLength(row: boolean[], n: number) {
  const copy = row.slice(0, n);
  while (copy.length < n) copy.push(false);
  return copy;
}

function headerKey(h: string) {
  return String(h ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function parseNumberLike(input: string) {
  const s = String(input ?? "").trim();
  if (!s) return null;

  // Remove currency symbols and grouping separators.
  const cleaned = s
    .replace(/[^0-9.,\-]/g, "")
    .replace(/,(?=\d{3}(\D|$))/g, ""); // remove thousands commas

  // Convert EU decimals if needed ("1.234,56" -> "1234.56")
  const eu = cleaned.match(/^\-?\d{1,3}(\.\d{3})+(,\d+)?$/);
  const normalized = eu ? cleaned.replace(/\./g, "").replace(/,/g, ".") : cleaned;

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function formatCurrency(n: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(n);
}

function isMoneyHeader(h: string) {
  const k = headerKey(h);
  return /amount|budget|planned|actual|spent|expense|income|cost|price|value|total|zar|usd|eur|gbp/.test(k);
}

function findColumn(headers: string[], pattern: RegExp) {
  const idx = headers.findIndex((h) => pattern.test(headerKey(h)));
  return idx >= 0 ? idx : null;
}

type BudgetSchema = {
  detected: boolean;
  plannedIdx: number | null;
  actualIdx: number | null;
  amountIdx: number | null;
  moneyCols: Set<number>;
};

function detectBudgetHeaders(headers: string[]): BudgetSchema {
  const plannedIdx = findColumn(headers, /^(planned|budget|target|forecast)/);
  const actualIdx = findColumn(headers, /^(actual|spent|expense|expenses|cost|costs)/);
  const amountIdx = findColumn(headers, /^(amount|value|total|income|price)/);

  const moneyCols = new Set<number>();
  headers.forEach((h, i) => {
    if (isMoneyHeader(h)) moneyCols.add(i);
  });

  const detected = Boolean(plannedIdx !== null || actualIdx !== null || amountIdx !== null || moneyCols.size > 0);

  return { detected, plannedIdx, actualIdx, amountIdx, moneyCols };
}

export default function Home({ targetSection }: HomeProps) {
  // Existing scaffold behavior: allow in-page anchors
  useEffect(() => {
    if (targetSection) document.getElementById(targetSection)?.scrollIntoView({ behavior: "smooth" });
  }, [targetSection]);

  const apiKey = (import.meta.env.VITE_GOOGLE_API_KEY as string | undefined) ??
    "AIzaSyBHqueJWPOC2wyn9eJX5tpYuudf816wja8";

  const [auth, setAuth] = useState<AuthState | null>(null);
  const [picked, setPicked] = useState<PickedSheet | null>(null);
  const [meta, setMeta] = useState<SpreadsheetMeta | null>(null);
  const [activeSheetTitle, setActiveSheetTitle] = useState<string | null>(null);
  const [snap, setSnap] = useState<SheetSnapshot | null>(null);

  // Store per-sheet edits so switching tabs doesn’t lose changes
  const [sheetState, setSheetState] = useState<
    Record<string, { headers: string[]; headerPlain: boolean[]; rows: RowModel[] }>
  >({});

  const [headerPlain, setHeaderPlain] = useState<boolean[]>([]);

  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<RowModel[]>([]);

  const [busyLoad, setBusyLoad] = useState(false);
  const [busySave, setBusySave] = useState(false);

  const [budgetMode, setBudgetMode] = useState(false);
  const [currency, setCurrency] = useState<string>("ZAR");

  const headerCount = useMemo(() => headers.length, [headers]);
  const budget = useMemo(() => detectBudgetHeaders(headers), [headers]);

  const budgetTotals = useMemo(() => {
    if (!budget.detected) return null;

    const plannedIdx = budget.plannedIdx;
    const actualIdx = budget.actualIdx;
    const amountIdx = budget.amountIdx;

    let planned = 0;
    let actual = 0;
    let amount = 0;

    for (const r of rows) {
      if (plannedIdx !== null) planned += parseNumberLike(r.cells[plannedIdx] ?? "") ?? 0;
      if (actualIdx !== null) actual += parseNumberLike(r.cells[actualIdx] ?? "") ?? 0;
      if (amountIdx !== null) amount += parseNumberLike(r.cells[amountIdx] ?? "") ?? 0;
    }

    const remaining = plannedIdx !== null && actualIdx !== null ? planned - actual : null;

    return { planned, actual, remaining, amount };
  }, [rows, budget]);

  async function ensureGapiReady() {
    if (!apiKey) throw new Error("Missing VITE_GOOGLE_API_KEY.");
    if (!auth?.accessToken) throw new Error("Not authenticated.");

    await initGapi(apiKey);
    setGapiToken(auth.accessToken);
  }

  function stashActiveEdits() {
    if (!activeSheetTitle) return;
    setSheetState((prev) => ({
      ...prev,
      [activeSheetTitle]: { headers, headerPlain, rows },
    }));
  }

  async function loadSpreadsheet(p: PickedSheet) {
    if (!auth?.accessToken) {
      toast.error("Connect to Google first.");
      return;
    }
    if (!apiKey) {
      toast.error("Missing VITE_GOOGLE_API_KEY. Needed to call Sheets API.");
      return;
    }

    setBusyLoad(true);
    try {
      await ensureGapiReady();

      const m = await fetchSpreadsheetMeta(p.spreadsheetId);
      setMeta(m);

      const first = m.sheetTitles[0] ?? "Sheet1";
      setActiveSheetTitle(first);

      const s = await fetchSheetAsTable({ spreadsheetId: p.spreadsheetId, sheetTitle: first });
      setSnap(s);

      const nextHeaders = s.headers.length ? s.headers : ["Column A"];
      const detected = detectBudgetHeaders(nextHeaders).detected;
      setBudgetMode(detected);

          const nextRows: RowModel[] = s.rows.map((r, idx) => ({
        id: nanoid(),
        cells: normalizeRowLength(r, Math.max(s.colCount, nextHeaders.length, 1)),
        plain: normalizeBoolLength(
          (s.rowPlain?.[idx] ?? []).map((v) => Boolean(v)),
          Math.max(s.colCount, nextHeaders.length, 1)
        ),
      }));
      const nextHeaderPlain = normalizeBoolLength(
        (s.headerPlain ?? []).map((v) => Boolean(v)),
        Math.max(s.colCount, nextHeaders.length, 1)
      );

      setHeaders(nextHeaders);
      setHeaderPlain(nextHeaderPlain);
      setRows(nextRows);
      setSheetState({
        [first]: { headers: nextHeaders, headerPlain: nextHeaderPlain, rows: nextRows },
      });

      toast.success(`Loaded: ${m.spreadsheetTitle} → ${first}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load spreadsheet");
    } finally {
      setBusyLoad(false);
    }
  }

  function resetSheet() {
    setPicked(null);
    setMeta(null);
    setActiveSheetTitle(null);
    setSnap(null);
    setHeaders([]);
    setHeaderPlain([]);
    setRows([]);
    setSheetState({});
  }

  async function switchSheet(nextTitle: string) {
    if (!snap) return;
    if (!apiKey) {
      toast.error("Missing VITE_GOOGLE_API_KEY.");
      return;
    }

    try {
      stashActiveEdits();
      setActiveSheetTitle(nextTitle);

      // If we already have local edits for that sheet, use them.
      const existing = sheetState[nextTitle];
      if (existing) {
        setHeaders(existing.headers);
        setHeaderPlain(existing.headerPlain);
        setRows(existing.rows);
        setBudgetMode(detectBudgetHeaders(existing.headers).detected);
        return;
      }

      // Otherwise fetch from Sheets API
      await ensureGapiReady();
      const s = await fetchSheetAsTable({ spreadsheetId: snap.spreadsheetId, sheetTitle: nextTitle });
      setSnap(s);

      const nextHeaders = s.headers.length ? s.headers : ["Column A"];
      const nextRows: RowModel[] = s.rows.map((r, idx) => ({
        id: nanoid(),
        cells: normalizeRowLength(r, Math.max(s.colCount, nextHeaders.length, 1)),
        plain: normalizeBoolLength(
          (s.rowPlain?.[idx] ?? []).map((v) => Boolean(v)),
          Math.max(s.colCount, nextHeaders.length, 1)
        ),
      }));

      const nextHeaderPlain = normalizeBoolLength(
        (s.headerPlain ?? []).map((v) => Boolean(v)),
        Math.max(s.colCount, nextHeaders.length, 1)
      );

      setHeaders(nextHeaders);
      setHeaderPlain(nextHeaderPlain);
      setRows(nextRows);
      setBudgetMode(detectBudgetHeaders(nextHeaders).detected);
      setSheetState((prev) => ({
        ...prev,
        [nextTitle]: { headers: nextHeaders, headerPlain: nextHeaderPlain, rows: nextRows },
      }));
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to switch sheet");
    }
  }

  function addRow() {
    const n = Math.max(headerCount, 1);
    setRows((prev) => [
      ...prev,
      { id: nanoid(), cells: Array.from({ length: n }, () => ""), plain: Array.from({ length: n }, () => false) },
    ]);
  }

  function addColumn() {
    setHeaders((prev) => {
      const next = prev.length ? [...prev, `Column ${prev.length + 1}`] : ["Column 1"];
      return next;
    });
    setHeaderPlain((prev) => [...prev, false]);
    setRows((prev) => prev.map((r) => ({ ...r, cells: [...r.cells, ""], plain: [...r.plain, false] })));
  }

  function deleteColumn(colIdx: number) {
    setHeaders((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== colIdx);
    });
    setHeaderPlain((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== colIdx)));
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        cells: r.cells.filter((_, i) => i !== colIdx),
        plain: r.plain.filter((_, i) => i !== colIdx),
      }))
    );
  }

  function deleteRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function updateCell(rowId: string, colIdx: number, value: string) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;

        const nextCells = r.cells.map((c, i) => (i === colIdx ? value : c));

        // "Plain text" heuristic: non-empty and not a number
        const asNumber = parseNumberLike(value);
        const isPlain = value.trim() !== "" && asNumber === null;
        const nextPlain = r.plain.map((p, i) => (i === colIdx ? isPlain : p));

        return { ...r, cells: nextCells, plain: nextPlain };
      })
    );
  }

  function updateHeader(colIdx: number, value: string) {
    setHeaders((prev) => prev.map((h, i) => (i === colIdx ? value : h)));
  }

  async function saveBack() {
    if (!snap) {
      toast.error("Nothing loaded.");
      return;
    }
    if (!activeSheetTitle) {
      toast.error("No sheet selected.");
      return;
    }
    if (!auth?.accessToken) {
      toast.error("Not authenticated.");
      return;
    }
    if (!apiKey) {
      toast.error("Missing VITE_GOOGLE_API_KEY.");
      return;
    }

    setBusySave(true);
    try {
      await ensureGapiReady();

      const n = Math.max(headers.length, 1);
      const cleanHeaders = normalizeRowLength(headers, n);
      const cleanRows = rows.map((r) => normalizeRowLength(r.cells, n));

      // Save current sheet
      await saveTableBackToSheet({
        spreadsheetId: snap.spreadsheetId,
        sheetTitle: activeSheetTitle,
        headers: cleanHeaders,
        rows: cleanRows,
      });

      // Update local cache
      setSheetState((prev) => ({
        ...prev,
        [activeSheetTitle]: { headers: cleanHeaders, headerPlain, rows },
      }));

      toast.success("Saved back to Google Sheets.");
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    } finally {
      setBusySave(false);
    }
  }

  const title = snap?.spreadsheetTitle ?? "Mobile Sheets Manager";
  const subtitle = snap
    ? `Editing: ${activeSheetTitle ?? snap.sheetTitle}`
    : "Connect → choose a spreadsheet → edit like a mini spreadsheet → save back.";

  return (
    <div className="min-h-screen">
      <header className="border-b-2 border-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto max-w-7xl px-4 py-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl leading-none tracking-tight">
                <span className="inline-block rounded-lg border border-border bg-primary text-primary-foreground px-3 py-1 mr-2">
                  CRUD
                </span>
                {title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{subtitle}</p>
            </div>

            {snap?.spreadsheetId ? (
              <div className="text-right">
                <a
                  className="text-xs underline decoration-2 underline-offset-4"
                  href={`https://docs.google.com/spreadsheets/d/${snap.spreadsheetId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Google Sheets
                </a>
                <div className="mt-2 flex justify-end gap-2 flex-wrap">
                  <Button variant="outline" className="border rounded-lg rounded-lg" size="sm" onClick={resetSheet}>
                    Change file
                  </Button>
                  <Button
                    className="border rounded-lg border-border brutal-shadow-sm rounded-lg"
                    size="sm"
                    onClick={saveBack}
                    disabled={busySave}
                  >
                    {busySave ? "Saving…" : "Save back"}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          {snap?.spreadsheetId && meta?.sheetTitles?.length ? (
            <div className="flex items-center gap-2 overflow-auto pb-1">
              {meta.sheetTitles.map((st) => {
                const active = st === activeSheetTitle;
                return (
                  <button
                    key={st}
                    onClick={() => switchSheet(st)}
                    className={
                      "whitespace-nowrap rounded-lg border px-4 py-2 text-sm transition-colors " +
                      (active
                        ? "border-border bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground")
                    }
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/*
            Left panel is only visible until a file is selected.
            After that we switch to a focused editor-only view.
          */}
          {!snap ? (
            <aside className="lg:col-span-4 space-y-4">
              <GoogleConnect
                auth={auth}
                onAuthChange={(a) => {
                  setAuth(a);
                  resetSheet();
                }}
              />

              {auth ? (
                <SheetPicker
                  accessToken={auth.accessToken}
                  onPick={(p) => {
                    setPicked(p);
                    loadSpreadsheet(p);
                  }}
                />
              ) : null}

              <Card className="p-4 border brutal-shadow-sm bg-card text-card-foreground">
                <p className="text-sm font-medium">How it saves</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This app writes values back to the same sheet using the Sheets API.
                  It does <span className="font-semibold">not</span> require exporting/importing.
                  Formatting is preserved (values-only update).
                </p>
                <Separator className="my-3" />
                <p className="text-xs text-muted-foreground">
                  Tip: Put column names in row 1. Everything below is editable data.
                </p>
              </Card>
            </aside>
          ) : null}

          <section className={snap ? "lg:col-span-12" : "lg:col-span-8"}>
            <Card className="border rounded-lg brutal-shadow bg-card text-card-foreground overflow-hidden">
              <div className="p-4 flex items-center justify-between gap-3 border-b-2 border-border">
                <div>
                  <p className="text-sm font-medium">Table editor</p>
                  <p className="text-xs text-muted-foreground">
                    {snap ? `Rows: ${rows.length} · Columns: ${Math.max(headers.length, 1)}` : "Load a sheet to begin."}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="border rounded-lg" size="sm" onClick={addRow} disabled={!snap}>
                    Add row
                  </Button>
                  <Button variant="outline" className="border rounded-lg" size="sm" onClick={addColumn} disabled={!snap}>
                    Add column
                  </Button>
                </div>
              </div>

              {snap && budget.detected ? (
                <div className="p-4 border-b-2 border-border bg-secondary text-secondary-foreground">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant={budgetMode ? "default" : "outline"}
                        className="border rounded-lg border-border brutal-shadow-sm"
                        size="sm"
                        onClick={() => setBudgetMode((v) => !v)}
                      >
                        {budgetMode ? "Budget view: ON" : "Budget view: OFF"}
                      </Button>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Currency</span>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger className="h-9 w-[140px] border bg-background">
                            <SelectValue placeholder="Currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ZAR">ZAR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {budgetTotals ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {budget.plannedIdx !== null ? (
                          <div className="border rounded-lg border-border bg-background text-foreground px-3 py-2 brutal-shadow-sm">
                            <p className="text-[11px] text-muted-foreground">Planned</p>
                            <p className="text-sm font-semibold">{formatCurrency(budgetTotals.planned, currency)}</p>
                          </div>
                        ) : null}

                        {budget.actualIdx !== null ? (
                          <div className="border rounded-lg border-border bg-background text-foreground px-3 py-2 brutal-shadow-sm">
                            <p className="text-[11px] text-muted-foreground">Actual</p>
                            <p className="text-sm font-semibold">{formatCurrency(budgetTotals.actual, currency)}</p>
                          </div>
                        ) : null}

                        {budgetTotals.remaining !== null ? (
                          <div className="border rounded-lg border-border bg-background text-foreground px-3 py-2 brutal-shadow-sm">
                            <p className="text-[11px] text-muted-foreground">Remaining</p>
                            <p
                              className={
                                "text-sm font-semibold " +
                                (budgetTotals.remaining >= 0 ? "text-emerald-700" : "text-destructive")
                              }
                            >
                              {formatCurrency(budgetTotals.remaining, currency)}
                            </p>
                          </div>
                        ) : null}

                        {budget.amountIdx !== null && budget.plannedIdx === null && budget.actualIdx === null ? (
                          <div className="border rounded-lg border-border bg-background text-foreground px-3 py-2 brutal-shadow-sm">
                            <p className="text-[11px] text-muted-foreground">Total</p>
                            <p className="text-sm font-semibold">{formatCurrency(budgetTotals.amount, currency)}</p>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    Budget view auto-detected money columns from your headers. Editing stays spreadsheet-compatible.
                  </p>
                </div>
              ) : null}

              {!snap ? (
                <div className="p-8">
                  <p className="text-sm">
                    {busyLoad ? "Loading…" : "No sheet loaded yet."}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Connect to Google, then use the picker or paste a spreadsheet ID.
                  </p>
                </div>
              ) : (
                <div className="p-2 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {headers.map((h, colIdx) => (
                          <TableHead key={colIdx} className="min-w-[220px]">
                            <div className="flex items-center gap-2">
                              <Input
                                value={h}
                                onChange={(e) => updateHeader(colIdx, e.target.value)}
                                className={
                                  "border rounded-lg bg-background " +
                                  (headerPlain[colIdx]
                                    ? "bg-[color:#919297] text-white placeholder:text-white/70"
                                    : "")
                                }
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="border rounded-lg px-2"
                                onClick={() => {
                                  if (headers.length <= 1) {
                                    toast.error("At least one column is required.");
                                    return;
                                  }
                                  deleteColumn(colIdx);
                                }}
                              >
                                ×
                              </Button>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {rows.map((r) => (
                        <TableRow key={r.id}>
                          {normalizeRowLength(r.cells, headers.length).map((cell, colIdx) => {                            const money = budgetMode && budget.moneyCols.has(colIdx);

                            return (
                              <TableCell key={colIdx} className="align-top">
                                <Input
                                  value={cell}
                                  onChange={(e) => updateCell(r.id, colIdx, e.target.value)}
                                  onBlur={(e) => {
                                    if (!money) return;
                                    const n = parseNumberLike(e.target.value);
                                    if (n === null) return;
                                    // Store a clean numeric string (so Google Sheets parses it as a number)
                                    updateCell(r.id, colIdx, String(Math.round(n * 100) / 100));
                                  }}
                                  inputMode={money ? "decimal" : undefined}
                                  className={
                                    "border bg-background " +
                                    (money ? "text-right font-mono" : "") +
                                    (r.plain?.[colIdx]
                                      ? " bg-[color:#919297] text-white placeholder:text-white/70"
                                      : "")
                                  }
                                  placeholder={money ? formatCurrency(0, currency) : undefined}
                                />
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </section>
        </div>
      </main>

      <footer className="border-t-2 border-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <span>Client-side OAuth · Google Sheets API v4</span>
          <span className="font-mono">{apiKey ? "API key configured" : "API key missing"}</span>
        </div>
      </footer>
    </div>
  );
}

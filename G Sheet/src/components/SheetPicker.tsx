import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileSpreadsheet, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  initGapi,
  listSpreadsheetFiles,
  openGoogleSheetPicker,
  setGapiToken,
  type DriveSheetFile,
  type PickedSheet,
} from "@/lib/googleApis";

export default function SheetPicker(props: {
  accessToken: string;
  onPick: (picked: PickedSheet) => void;
}) {
  const apiKey = (import.meta.env.VITE_GOOGLE_API_KEY as string | undefined) ??
    "AIzaSyBHqueJWPOC2wyn9eJX5tpYuudf816wja8";
  const appId = import.meta.env.VITE_GOOGLE_APP_ID as string | undefined;

  const [manualId, setManualId] = useState("");

  // Fallback browser (works without App ID)
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<DriveSheetFile[]>([]);

  const canUseDriveBrowser = Boolean(apiKey);
  const canUseGooglePicker = Boolean(apiKey && appId);

  useEffect(() => {
    if (!open) return;
    if (!apiKey) return;

    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        await initGapi(apiKey as string);
        setGapiToken(props.accessToken);
        const res = await listSpreadsheetFiles({ query: q, pageSize: 50 });
        if (!cancelled) setFiles(res);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Failed to list Drive files");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Debounced-ish: small delay so typing doesn't spam
    const t = window.setTimeout(run, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [open, q, apiKey, props.accessToken]);

  async function openPicker() {
    if (!apiKey || !appId) {
      toast.error("Picker needs VITE_GOOGLE_API_KEY + VITE_GOOGLE_APP_ID. Use Browse Drive instead.");
      return;
    }

    try {
      const picked = await openGoogleSheetPicker({
        apiKey,
        appId,
        accessToken: props.accessToken,
      });
      props.onPick(picked);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      if (message.toLowerCase().includes("cancel")) return;
      toast.error(message || "Failed to open picker");
    }
  }

  function pickFromDrive(f: DriveSheetFile) {
    props.onPick({
      spreadsheetId: f.id,
      name: f.name,
      url: `https://docs.google.com/spreadsheets/d/${f.id}`,
    });
    setOpen(false);
  }

  function submitManual() {
    const trimmed = manualId.trim();
    if (!trimmed) {
      toast.error("Paste a Spreadsheet ID.");
      return;
    }
    props.onPick({
      spreadsheetId: trimmed,
      name: "(Manual spreadsheet)",
      url: `https://docs.google.com/spreadsheets/d/${trimmed}`,
    });
  }

  return (
    <Card className="p-4 border brutal-shadow-sm bg-card text-card-foreground">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-sm border border-border bg-secondary text-secondary-foreground p-2">
          <FileSpreadsheet className="h-4 w-4" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Pick a Google Sheet</p>
              <p className="text-xs text-muted-foreground">
                Browse Drive (works in preview) or paste a Spreadsheet ID. Google Picker is optional.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant={canUseDriveBrowser ? "default" : "outline"}
                    className="border border-border brutal-shadow-sm"
                    disabled={!canUseDriveBrowser}
                    size="sm"
                  >
                    <Search className="h-4 w-4" />
                    Browse Drive
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl border brutal-shadow">
                  <DialogHeader>
                    <DialogTitle>Choose a spreadsheet</DialogTitle>
                  </DialogHeader>

                  <div className="flex gap-2">
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search by name (optional)"
                      className="border"
                    />
                    <Button
                      variant="outline"
                      className="border"
                      onClick={() => {
                        setQ("");
                      }}
                    >
                      Clear
                    </Button>
                  </div>

                  <div className="mt-3">
                    <ScrollArea className="h-[340px] rounded-sm border border-border bg-background">
                      <div className="p-2">
                        {loading ? (
                          <p className="text-sm text-muted-foreground p-3">Loading…</p>
                        ) : files.length ? (
                          <div className="space-y-2">
                            {files.map((f) => (
                              <button
                                key={f.id}
                                className="w-full text-left border border-border bg-card text-card-foreground brutal-shadow-sm px-3 py-2 hover:translate-x-[1px] hover:translate-y-[1px] transition-transform"
                                onClick={() => pickFromDrive(f)}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-medium">{f.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {f.owners?.length ? `Owner: ${f.owners[0]}` : ""}
                                    </p>
                                  </div>
                                  <span className="text-xs text-muted-foreground">{f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString() : ""}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground p-3">No spreadsheets found.</p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3">
                    If you don’t see a shared sheet, make sure it’s shared to the same Google account you connected with,
                    and that Drive API is enabled.
                  </p>
                </DialogContent>
              </Dialog>

              <Button
                variant={canUseGooglePicker ? "outline" : "outline"}
                className="border"
                onClick={openPicker}
                disabled={!canUseGooglePicker}
                size="sm"
                title={canUseGooglePicker ? "" : "Needs VITE_GOOGLE_APP_ID"}
              >
                Picker
              </Button>
            </div>
          </div>

          {!apiKey ? (
            <p className="mt-3 text-xs text-destructive">
              Missing <span className="font-mono">VITE_GOOGLE_API_KEY</span> (required to browse Drive / call Sheets).
            </p>
          ) : !appId ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Tip: set <span className="font-mono">VITE_GOOGLE_APP_ID</span> to enable the Google Picker button.
            </p>
          ) : null}

          <div className="mt-4 flex gap-2">
            <Input
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="Spreadsheet ID (the part after /d/ in the URL)"
              className="border"
            />
            <Button onClick={submitManual} variant="outline" className="border" size="sm">
              Load
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

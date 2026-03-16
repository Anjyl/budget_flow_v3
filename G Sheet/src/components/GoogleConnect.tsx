import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LogIn, LogOut, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { GOOGLE_SCOPES, requestAccessToken, revokeToken } from "@/lib/googleAuth";

export type AuthState = {
  accessToken: string;
  scope: string;
};

export default function GoogleConnect(props: {
  onAuthChange: (auth: AuthState | null) => void;
  auth: AuthState | null;
}) {
  const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ??
    "1086160483736-3siaqhc081ac9j0onr3lqlabarehmvpl.apps.googleusercontent.com";

  const scope = useMemo(() => {
    // drive.readonly is needed for Picker/Drive discovery; spreadsheets for read/write.
    return [GOOGLE_SCOPES.driveReadonly, GOOGLE_SCOPES.sheets].join(" ");
  }, []);

  const [busy, setBusy] = useState(false);

  const canConnect = Boolean(clientId);

  async function connect() {
    if (!clientId) {
      toast.error("Missing Google OAuth Client ID.");
      return;
    }

    setBusy(true);
    try {
      const t = await requestAccessToken({ clientId, scope });
      props.onAuthChange({ accessToken: t.access_token, scope: t.scope });
      toast.success("Connected to Google.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to connect");
    } finally {
      setBusy(false);
    }
  }

  function disconnect() {
    if (props.auth?.accessToken) revokeToken(props.auth.accessToken);
    props.onAuthChange(null);
    toast.message("Disconnected.");
  }

  return (
    <Card className="p-4 border brutal-shadow-sm bg-card text-card-foreground">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg border border-border bg-primary text-primary-foreground p-2">
          <Shield className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Google connection</p>
              <p className="text-xs text-muted-foreground">
                OAuth is done in-browser via Google Identity Services.
              </p>
            </div>

            {props.auth ? (
              <Button variant="outline" onClick={disconnect} className="border" size="sm">
                <LogOut className="h-4 w-4" />
                Disconnect
              </Button>
            ) : (
              <Button
                onClick={connect}
                className="border border-border brutal-shadow-sm"
                size="sm"
                disabled={!canConnect || busy}
              >
                <LogIn className="h-4 w-4" />
                {busy ? "Connecting…" : "Connect"}
              </Button>
            )}
          </div>

          {!canConnect ? (
            <p className="mt-3 text-xs text-destructive">
              Missing config: set <span className="font-mono">VITE_GOOGLE_CLIENT_ID</span>.
            </p>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              OAuth Client ID: <span className="font-mono break-all">{clientId}</span>
            </p>
          )}

          {props.auth ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Scope: <span className="font-mono">{props.auth.scope}</span>
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

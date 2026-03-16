import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// import { trpc } from "@/lib/trpc";
import { FileText, Search, CheckCircle2, Clock, User, ExternalLink, LogOut } from "lucide-react";
import { toast } from "sonner";
import { initGapi, listSpreadsheetFiles, setGapiToken, type DriveSheetFile } from "@/lib/googleApis";
import { useSheet } from "@/contexts/SheetContext";
import Onboarding from "@/components/Onboarding";

interface GoogleFile {
  id: string;
  name: string;
  modifiedTime?: string;
  owners?: any[];
  webViewLink?: string;
}

export default function FileChooser() {
  const { isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const { setSelectedSheet, auth, isAuthenticated: sheetAuth } = useSheet();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/landing");
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  const [files, setFiles] = useState<GoogleFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<GoogleFile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<GoogleFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!loading && !sheetAuth) {
      navigate("/landing");
    }
  }, [sheetAuth, loading, navigate]);

  // Load files from Google Drive
  useEffect(() => {
    if (sheetAuth && auth) {
      loadFiles();
    }
  }, [sheetAuth, auth]);

  // Filter files based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFiles(files);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredFiles(
        files.filter((file) =>
          file.name.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, files]);

  const loadFiles = async () => {
    if (!auth) return;
    try {
      setIsLoading(true);
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || "AIzaSyBHqueJWPOC2wyn9eJX5tpYuudf816wja8";
      await initGapi(apiKey);
      setGapiToken(auth.accessToken);
      const driveFiles = await listSpreadsheetFiles({ query: "", pageSize: 50 });
      const mappedFiles: GoogleFile[] = driveFiles.map((f) => ({
        id: f.id,
        name: f.name,
        modifiedTime: f.modifiedTime ?? "",
        owners: f.owners as any[],
        webViewLink: (f as any).webViewLink ?? "",
      }));
      setFiles(mappedFiles);
    } catch (error) {
      toast.error("Failed to load files from Google Drive");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFile = async (file: GoogleFile) => {
    try {
      setSelectedFile(file);
      setSelectedSheet({
        id: file.id,
        name: file.name,
        modifiedTime: file.modifiedTime ?? "",
      });
      toast.success(`Selected: ${file.name}`);
      
      // Navigate to dashboard after a brief delay
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      toast.error("Failed to select file");
      setSelectedFile(null);
    }
  };

  // Redirect to landing if not authenticated (before rendering anything)
  if (!loading && !sheetAuth) {
    return null; // Will redirect via useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-emerald-400 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-emerald-400 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if not completed
  if (!onboardingCompleted) {
    return <Onboarding onComplete={() => setOnboardingCompleted(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Sign Out */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1 text-center">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                Document Editor
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Select a spreadsheet from your Google Drive to begin editing
              </p>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white border-0 gap-2 ml-4"
              size="sm"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-emerald-400" />
            <Input
              placeholder="Search your files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg border-2 border-emerald-500/30 bg-slate-800 text-white placeholder-slate-400 focus:border-emerald-400 focus:bg-slate-700/50 transition-all"
            />
          </div>
        </div>

        {/* Files Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-emerald-400 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-emerald-400 mt-4 text-lg">Loading your files...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <Card className="border-2 border-dashed border-emerald-500/30 bg-slate-800/50 backdrop-blur-xl">
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="h-16 w-16 text-emerald-400/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-emerald-300 mb-2">
                {files.length === 0 ? "No files found" : "No matching files"}
              </h3>
              <p className="text-emerald-200/60">
                {files.length === 0
                  ? "You don't have any Google Sheets yet. Create one in Google Drive to get started."
                  : "Try adjusting your search query"}
              </p>
              {files.length === 0 && (
                <Button
                  onClick={loadFiles}
                  className="mt-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0"
                >
                  Refresh
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFiles.map((file) => (
              <Card
                key={file.id}
                className={`cursor-pointer transition-all hover:shadow-2xl hover:shadow-emerald-500/20 bg-slate-800/50 backdrop-blur-xl border-slate-700/50 ${
                  selectedFile?.id === file.id
                    ? "ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/30 bg-slate-800/80"
                    : "hover:border-emerald-500/30"
                }`}
                onClick={() => handleSelectFile(file)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <FileText className="h-8 w-8 text-emerald-400 flex-shrink-0 mt-1" />
                    {selectedFile?.id === file.id && (
                      <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0" />
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2 text-white">
                    {file.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Modified Time */}
                  <div className="flex items-center gap-2 text-sm text-emerald-300/70">
                    <Clock className="h-4 w-4" />
                    <span>
                      Modified:{" "}
                      {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : ""}
                    </span>
                  </div>

                  {/* Owner */}
                  {file.owners && file.owners.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-emerald-300/70">
                      <User className="h-4 w-4" />
                      <span>{file.owners[0].displayName}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectFile(file);
                      }}
                      className={`flex-1 font-semibold transition-all ${
                        selectedFile?.id === file.id
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0"
                          : "bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl"
                      }`}
                      disabled={selectedFile?.id === file.id}
                    >
                      {selectedFile?.id === file.id ? "✓ Selected" : "Select"}
                    </Button>
                    {file.webViewLink && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(file.webViewLink, "_blank");
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-emerald-400 border-slate-600 hover:border-emerald-500/50"
                        size="icon"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        {files.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              onClick={loadFiles}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl font-semibold"
            >
              Refresh Files
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

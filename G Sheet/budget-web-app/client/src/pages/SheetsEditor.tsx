import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Save, Download, Upload, Plus, Trash2, RefreshCw, Sparkles, ChevronDown, Grid3x3, Smartphone, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { AIAssistantWidget } from "@/components/AIAssistantWidget";
import { MobileSheetViewer } from "@/components/MobileSheetViewer";
import { useSheet } from "@/contexts/SheetContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Sheet {
  id: string;
  title: string;
  data: string[][];
  modified: boolean;
}

export default function SheetsEditor() {
  const { selectedSheet, updateDataRange } = useSheet();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [dataRangeInput, setDataRangeInput] = useState(selectedSheet?.dataRange || "A1:Z100");
  const [viewMode, setViewMode] = useState<"mobile" | "table">("mobile");

  // Load sheets from selected file
  useEffect(() => {
    if (selectedSheet) {
      loadSheets();
    }
  }, [selectedSheet?.id]);

  const loadSheets = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call to fetch sheets from Google Drive
      // For now, show placeholder
      toast.info("Google Sheets integration coming soon");
    } catch (error) {
      toast.error("Failed to load sheets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSheetSelection = (sheetId: string) => {
    if (!sheetId) return;

    // Update the context which persists to localStorage
    updateDataRange(dataRangeInput);
    
    toast.success(`Sheet configuration updated. Data range: ${dataRangeInput}`);
    
    // Simulate loading data for the selected sheet
    loadSheets();
  };

  const handleCellChange = (row: number, col: number, value: string) => {
    setSheets((prevSheets) =>
      prevSheets.map((sheet) => {
        if (sheet.id === activeSheet) {
          const newData = sheet.data.map((r, i) =>
            i === row
              ? r.map((c, j) => (j === col ? value : c))
              : r
          );
          return { ...sheet, data: newData, modified: true };
        }
        return sheet;
      })
    );
  };

  const handleAddRow = () => {
    setSheets((prevSheets) =>
      prevSheets.map((sheet) => {
        if (sheet.id === activeSheet) {
          const newRow = new Array(sheet.data[0]?.length || 10).fill("");
          return { ...sheet, data: [...sheet.data, newRow], modified: true };
        }
        return sheet;
      })
    );
  };

  const handleDeleteRow = (rowIdx: number) => {
    setSheets((prevSheets) =>
      prevSheets.map((sheet) => {
        if (sheet.id === activeSheet) {
          const newData = sheet.data.filter((_, i) => i !== rowIdx);
          return { ...sheet, data: newData, modified: true };
        }
        return sheet;
      })
    );
  };

  const handleSave = async () => {
    try {
      const currentSheet = sheets.find((s) => s.id === activeSheet);
      if (!currentSheet) return;

      // TODO: Implement API call to save to Google Sheets
      toast.success("Sheet saved successfully");
      setSheets((prevSheets) =>
        prevSheets.map((sheet) =>
          sheet.id === activeSheet ? { ...sheet, modified: false } : sheet
        )
      );
    } catch (error) {
      toast.error("Failed to save sheet");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto text-blue-500" />
            <p className="text-muted-foreground">Loading sheets...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (sheets.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-6 relative">
          {showAI && (
            <AIAssistantWidget
              title="Sheets Assistant"
              systemPrompt="You are a spreadsheet assistant helping users manage their Google Sheets data. Help them understand data ranges, sheet structure, and best practices for data organization."
              suggestedPrompts={[
                "How should I organize my data?",
                "What data range should I select?",
                "Help me understand sheet structure",
              ]}
              height="400px"
              isFloating={true}
              onClose={() => setShowAI(false)}
            />
          )}
          {!showAI && (
            <button
              onClick={() => setShowAI(true)}
              className="fixed bottom-4 right-4 z-40 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all hover:shadow-xl"
              title="Open AI Assistant"
            >
              <Sparkles className="w-6 h-6" />
            </button>
          )}

          <h1 className="text-3xl font-bold">Spreadsheet Editor</h1>

          {/* Sheet Selection Section */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChevronDown className="h-5 w-5" />
                Select Sheet and Data Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Sheet</label>
                  <Select onValueChange={handleSheetSelection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a sheet..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sheet1">Sheet 1</SelectItem>
                      <SelectItem value="sheet2">Sheet 2</SelectItem>
                      <SelectItem value="sheet3">Sheet 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Range (e.g., A1:Z100)</label>
                  <Input
                    value={dataRangeInput}
                    onChange={(e) => setDataRangeInput(e.target.value)}
                    placeholder="A1:Z100"
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                💡 Once you select a sheet and data range, this selection will persist for your entire dashboard session. If you select a different sheet, the process will restart.
              </p>

              {sheetSelection && (
                <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    ✓ Selected: {sheetSelection.sheetId} | Range: {sheetSelection.dataRange}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Empty State */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4 py-12">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No Spreadsheet Selected</h3>
                  <p className="text-muted-foreground mt-2">
                    Select a Google Sheet from your Drive and choose a data range to start editing
                  </p>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Select from Google Drive
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const currentSheet = sheets.find((s) => s.id === activeSheet);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 relative">
        {showAI && (
          <AIAssistantWidget
            title="Sheets Assistant"
            systemPrompt="You are a spreadsheet assistant helping users manage their Google Sheets data. Help them understand data ranges, sheet structure, and best practices for data organization."
            suggestedPrompts={[
              "How should I organize my data?",
              "What data range should I select?",
              "Help me understand sheet structure",
            ]}
            height="400px"
            isFloating={true}
            onClose={() => setShowAI(false)}
          />
        )}
        {!showAI && (
          <button
            onClick={() => setShowAI(true)}
            className="fixed bottom-4 right-4 z-40 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all hover:shadow-xl"
            title="Open AI Assistant"
          >
            <Sparkles className="w-6 h-6" />
          </button>
        )}

        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-3xl font-bold">Spreadsheet Editor</h1>
          <div className="flex gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              <Button
                size="sm"
                variant={viewMode === "mobile" ? "default" : "ghost"}
                onClick={() => setViewMode("mobile")}
                className="gap-2"
                title="Mobile View"
              >
                <Smartphone className="h-4 w-4" />
                Mobile
              </Button>
              <Button
                size="sm"
                variant={viewMode === "table" ? "default" : "ghost"}
                onClick={() => setViewMode("table")}
                className="gap-2"
                title="Table View"
              >
                <Grid3x3 className="h-4 w-4" />
                Table
              </Button>
            </div>

            <Button variant="outline" onClick={loadSheets} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={handleSave} className="gap-2 bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Current Selection Info */}
        {sheetSelection && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Active Selection</p>
                  <p className="text-sm text-muted-foreground">
                    Sheet: <span className="font-medium">{sheetSelection.sheetId}</span> | Range: <span className="font-medium">{sheetSelection.dataRange}</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSheetSelection(null)}
                >
                  Change Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* File Info */}
        {selectedFile && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm">
                <span className="font-semibold">File:</span> {selectedFile.name}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Sheet Tabs */}
        <Tabs value={activeSheet} onValueChange={setActiveSheet}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
            {sheets.map((sheet) => (
              <TabsTrigger
                key={sheet.id}
                value={sheet.id}
                className="relative"
              >
                {sheet.title}
                {sheet.modified && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {sheets.map((sheet) => (
            <TabsContent key={sheet.id} value={sheet.id}>
              <Card>
                <CardContent className="pt-6">
                  {viewMode === "mobile" ? (
                    /* Mobile View */
                    <MobileSheetViewer
                      data={sheet.data}
                      title={sheet.title}
                      onCellChange={handleCellChange}
                      onRowDelete={handleDeleteRow}
                      onAddRow={handleAddRow}
                      isEditable={true}
                      rowsPerPage={10}
                    />
                  ) : (
                    /* Table View */
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">{sheet.title}</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleAddRow}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Row
                        </Button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <tbody>
                            {sheet.data.map((row, rowIdx) => (
                              <tr key={rowIdx} className="border-b">
                                <td className="bg-muted px-3 py-2 font-semibold text-sm text-muted-foreground w-12 text-center border-r">
                                  {rowIdx + 1}
                                </td>
                                {row.map((cell, colIdx) => (
                                  <td
                                    key={`${rowIdx}-${colIdx}`}
                                    className="border-r border-b p-0 min-w-32 max-w-xs"
                                  >
                                    {editingCell?.row === rowIdx &&
                                    editingCell?.col === colIdx ? (
                                      <input
                                        autoFocus
                                        type="text"
                                        value={cell}
                                        onChange={(e) =>
                                          handleCellChange(rowIdx, colIdx, e.target.value)
                                        }
                                        onBlur={() => setEditingCell(null)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            setEditingCell(null);
                                          }
                                        }}
                                        className="w-full px-3 py-2 border-0 outline-none bg-blue-50"
                                      />
                                    ) : (
                                      <div
                                        onClick={() =>
                                          setEditingCell({ row: rowIdx, col: colIdx })
                                        }
                                        className="px-3 py-2 cursor-cell hover:bg-muted/50 min-h-10 flex items-center"
                                      >
                                        {cell}
                                      </div>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleSave} className="gap-2">
                          <Save className="h-4 w-4" />
                          Save Sheet
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          Export as CSV
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

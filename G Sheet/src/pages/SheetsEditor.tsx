import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Download, Upload, Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useSheet } from "@/contexts/SheetContext";
import { fetchFirstSheetAsTable, saveTableBackToSheet, type SheetSnapshot } from "@/lib/googleApis";

interface Sheet {
  id: string;
  title: string;
  data: string[][];
  modified: boolean;
}

export default function SheetsEditor() {
  const { selectedSheet, auth } = useSheet();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);

  // Load sheets from selected file
  useEffect(() => {
    if (selectedSheet && auth) {
      loadSheets();
    }
  }, [selectedSheet, auth]);

  const loadSheets = async () => {
    if (!selectedSheet || !auth) return;
    try {
      setIsLoading(true);
      const snapshot: SheetSnapshot = await fetchFirstSheetAsTable(selectedSheet.id);
      const sheet: Sheet = {
        id: snapshot.sheetTitle,
        title: snapshot.sheetTitle,
        data: [snapshot.headers, ...snapshot.rows],
        modified: false,
      };
      setSheets([sheet]);
      setActiveSheet(snapshot.sheetTitle);
    } catch (error) {
      toast.error("Failed to load sheets");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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

  const handleSave = async () => {
    if (!selectedSheet) return;
    try {
      const currentSheet = sheets.find((s) => s.id === activeSheet);
      if (!currentSheet) return;

      const headers = currentSheet.data[0] || [];
      const rows = currentSheet.data.slice(1);

      await saveTableBackToSheet({
        spreadsheetId: selectedSheet.id,
        sheetTitle: currentSheet.title,
        headers,
        rows,
      });

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
        <div className="space-y-6 p-6">
          <h1 className="text-3xl font-bold">Spreadsheet Editor</h1>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4 py-12">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No Spreadsheet Selected</h3>
                  <p className="text-muted-foreground mt-2">
                    Select a Google Sheet from your Drive to start editing
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
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Spreadsheet Editor</h1>
          <div className="flex gap-2">
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

        {/* File Info */}
        {selectedSheet && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm">
                <span className="font-semibold">File:</span> {selectedSheet.name}
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
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle>{sheet.title}</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddRow}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Row
                  </Button>
                </CardHeader>
                <CardContent>
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

                  <div className="mt-6 flex gap-2">
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Sheet
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Export as CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

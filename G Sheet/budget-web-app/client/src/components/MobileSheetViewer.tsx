import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Edit2, Trash2, Plus } from "lucide-react";

interface MobileSheetViewerProps {
  /**
   * Sheet data as 2D array
   */
  data: string[][];

  /**
   * Sheet title
   */
  title: string;

  /**
   * Headers (first row)
   */
  headers?: string[];

  /**
   * Callback when cell is edited
   */
  onCellChange?: (row: number, col: number, value: string) => void;

  /**
   * Callback when row is deleted
   */
  onRowDelete?: (row: number) => void;

  /**
   * Callback when add row is clicked
   */
  onAddRow?: () => void;

  /**
   * Whether to show edit/delete buttons
   */
  isEditable?: boolean;

  /**
   * Maximum rows to display per page
   */
  rowsPerPage?: number;
}

export function MobileSheetViewer({
  data,
  title,
  headers,
  onCellChange,
  onRowDelete,
  onAddRow,
  isEditable = true,
  rowsPerPage = 10,
}: MobileSheetViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState("");

  const sheetHeaders = headers || (data.length > 0 ? data[0] : []);
  const sheetData = headers ? data : data.slice(1);

  // Simple assessment logic for mobile view
  const assessData = (row: string[]) => {
    // Look for common financial keywords to highlight data
    const hasAmount = row.some(cell => cell.includes("R") || cell.includes("$") || /^\d+(\.\d{2})?$/.test(cell));
    const hasDate = row.some(cell => /\d{4}-\d{2}-\d{2}/.test(cell) || /\d{2}\/\d{2}\/\d{4}/.test(cell));
    return { hasAmount, hasDate };
  };

  const totalPages = Math.ceil(sheetData.length / rowsPerPage);
  const startIdx = currentPage * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const currentRows = sheetData.slice(startIdx, endIdx);

  const toggleRowExpanded = (rowIdx: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowIdx)) {
      newExpanded.delete(rowIdx);
    } else {
      newExpanded.add(rowIdx);
    }
    setExpandedRows(newExpanded);
  };

  const handleEditCell = (row: number, col: number, value: string) => {
    setEditingCell({ row, col });
    setEditValue(value);
  };

  const handleSaveCell = (row: number, col: number) => {
    if (onCellChange) {
      onCellChange(row, col, editValue);
    }
    setEditingCell(null);
  };

  const handleDeleteRow = (row: number) => {
    if (confirm("Are you sure you want to delete this row?")) {
      if (onRowDelete) {
        onRowDelete(row);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        {isEditable && (
          <Button
            size="sm"
            onClick={onAddRow}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Row
          </Button>
        )}
      </div>

      {/* Mobile Cards View */}
      <div className="space-y-3">
        {currentRows.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                No data available
              </p>
            </CardContent>
          </Card>
        ) : (
          currentRows.map((row, idx) => {
            const absoluteRowIdx = startIdx + idx;
            const isExpanded = expandedRows.has(absoluteRowIdx);

            return (
              <Card
                key={absoluteRowIdx}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Card Header - Summary View */}
                <CardHeader
                  className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleRowExpanded(absoluteRowIdx)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded">
                          #{absoluteRowIdx + 1}
                        </span>
                        {/* Show first few columns as preview with assessment */}
                        <div className="truncate">
                          <p className="font-semibold text-sm truncate">
                            {row[0] || "—"}
                          </p>
                          <div className="flex gap-2 items-center">
                            {row[1] && (
                              <p className="text-xs text-muted-foreground truncate">
                                {row[1]}
                              </p>
                            )}
                            {assessData(row).hasAmount && (
                              <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded font-medium">Financial</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRowExpanded(absoluteRowIdx);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </CardHeader>

                {/* Card Content - Expanded View */}
                {isExpanded && (
                  <CardContent className="space-y-4 pt-0 border-t">
                    {/* Data Fields */}
                    <div className="space-y-3">
                      {row.map((cell, colIdx) => {
                        const isEditing =
                          editingCell?.row === absoluteRowIdx &&
                          editingCell?.col === colIdx;

                        return (
                          <div key={colIdx} className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              {sheetHeaders[colIdx] || `Column ${colIdx + 1}`}
                            </label>
                            {isEditing ? (
                              <div className="flex gap-2">
                                <input
                                  autoFocus
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleSaveCell(absoluteRowIdx, colIdx);
                                    } else if (e.key === "Escape") {
                                      setEditingCell(null);
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleSaveCell(absoluteRowIdx, colIdx)
                                  }
                                  className="h-9"
                                >
                                  Save
                                </Button>
                              </div>
                            ) : (
                              <div
                                onClick={() =>
                                  isEditable &&
                                  handleEditCell(
                                    absoluteRowIdx,
                                    colIdx,
                                    cell
                                  )
                                }
                                className={`px-3 py-2 rounded-lg text-sm min-h-9 flex items-center ${
                                  isEditable
                                    ? "bg-muted hover:bg-muted/70 cursor-pointer transition-colors"
                                    : "bg-muted"
                                }`}
                              >
                                {cell || "—"}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Buttons */}
                    {isEditable && (
                      <div className="flex gap-2 pt-3 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDeleteRow(absoluteRowIdx)
                          }
                          className="flex-1 gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
            }
            disabled={currentPage === totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}

      {/* Summary Info */}
      <div className="text-xs text-muted-foreground text-center pt-2">
        Showing {startIdx + 1} to {Math.min(endIdx, sheetData.length)} of{" "}
        {sheetData.length} rows
      </div>
    </div>
  );
}

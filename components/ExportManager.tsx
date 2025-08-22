"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface ExportOptions {
  format: "csv" | "excel" | "pdf" | "json"
  dateRange: "all" | "30d" | "90d" | "1y" | "custom"
  includeArchived: boolean
  includeCompleted: boolean
  customStartDate?: string
  customEndDate?: string
}

interface ExportManagerProps {
  isOpen: boolean
  onClose: () => void
  exportType: "projects" | "tasks" | "team" | "files" | "calendar" | "analytics" | "workspace"
  data?: any[]
  onExport: (options: ExportOptions) => void
}

export default function ExportManager({ isOpen, onClose, exportType, data, onExport }: ExportManagerProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "csv",
    dateRange: "all",
    includeArchived: false,
    includeCompleted: true,
  })

  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await onExport(exportOptions)
      onClose()
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const getExportTitle = () => {
    switch (exportType) {
      case "projects":
        return "Export Projects"
      case "tasks":
        return "Export Tasks"
      case "team":
        return "Export Team Data"
      case "files":
        return "Export File List"
      case "calendar":
        return "Export Calendar Events"
      case "analytics":
        return "Export Analytics Report"
      case "workspace":
        return "Export Workspace Data"
      default:
        return "Export Data"
    }
  }

  const getExportDescription = () => {
    switch (exportType) {
      case "projects":
        return "Export project information including status, progress, and team assignments"
      case "tasks":
        return "Export task details, assignments, and completion status"
      case "team":
        return "Export team member information and performance metrics"
      case "files":
        return "Export file metadata and organization structure"
      case "calendar":
        return "Export calendar events and scheduling information"
      case "analytics":
        return "Export analytics data and performance metrics"
      case "workspace":
        return "Export complete workspace data including all projects, tasks, and team information"
      default:
        return "Export selected data in your preferred format"
    }
  }

  const formatOptions = [
    { value: "csv", label: "CSV", icon: "📋", description: "Comma-separated values for spreadsheets" },
    { value: "excel", label: "Excel", icon: "📊", description: "Microsoft Excel format with formatting" },
    { value: "pdf", label: "PDF", icon: "📄", description: "Formatted document for sharing and printing" },
    { value: "json", label: "JSON", icon: "🔧", description: "Structured data for technical use" },
  ]

  const dateRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" },
    { value: "1y", label: "Last Year" },
    { value: "custom", label: "Custom Range" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{getExportTitle()}</DialogTitle>
          <DialogDescription className="text-white/70">{getExportDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-white font-medium">Export Format</Label>
            <div className="grid grid-cols-2 gap-3">
              {formatOptions.map((format) => (
                <button
                  key={format.value}
                  onClick={() => setExportOptions({ ...exportOptions, format: format.value as any })}
                  className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                    exportOptions.format === format.value
                      ? "gradient-primary border-white/30 shadow-lg"
                      : "glass border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{format.icon}</span>
                    <div>
                      <div className="font-medium text-white">{format.label}</div>
                      <div className="text-xs text-white/60">{format.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-white font-medium">Date Range</Label>
            <Select
              value={exportOptions.dateRange}
              onValueChange={(value) => setExportOptions({ ...exportOptions, dateRange: value as any })}
            >
              <SelectTrigger className="glass border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/10">
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {exportOptions.dateRange === "custom" && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="space-y-2">
                  <Label className="text-white/80 text-sm">Start Date</Label>
                  <Input
                    type="date"
                    value={exportOptions.customStartDate || ""}
                    onChange={(e) => setExportOptions({ ...exportOptions, customStartDate: e.target.value })}
                    className="glass border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80 text-sm">End Date</Label>
                  <Input
                    type="date"
                    value={exportOptions.customEndDate || ""}
                    onChange={(e) => setExportOptions({ ...exportOptions, customEndDate: e.target.value })}
                    className="glass border-white/20 text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <Label className="text-white font-medium">Export Options</Label>
            <div className="space-y-3">
              {(exportType === "projects" || exportType === "workspace") && (
                <label className="flex items-center gap-3 p-3 glass rounded-lg cursor-pointer hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeArchived}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeArchived: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20"
                  />
                  <div>
                    <div className="text-white font-medium">Include Archived Projects</div>
                    <div className="text-white/60 text-sm">Export archived and inactive projects</div>
                  </div>
                </label>
              )}

              {(exportType === "tasks" || exportType === "workspace") && (
                <label className="flex items-center gap-3 p-3 glass rounded-lg cursor-pointer hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeCompleted}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeCompleted: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20"
                  />
                  <div>
                    <div className="text-white font-medium">Include Completed Tasks</div>
                    <div className="text-white/60 text-sm">Export completed and closed tasks</div>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Data Preview */}
          {data && (
            <div className="space-y-3">
              <Label className="text-white font-medium">Data Preview</Label>
              <div className="glass p-4 rounded-lg border border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/70">Records to export:</span>
                  <span className="text-white font-medium">{data.length} items</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-white/70">Estimated file size:</span>
                  <span className="text-white font-medium">
                    {exportOptions.format === "pdf" ? "~2-5 MB" : "~50-200 KB"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={onClose} className="glass border-white/20 text-white bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting} className="gradient-primary text-white">
              {isExporting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Exporting...
                </div>
              ) : (
                `Export ${exportOptions.format.toUpperCase()}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

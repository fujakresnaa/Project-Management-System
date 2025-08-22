"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface BulkExportOptions {
  includeProjects: boolean
  includeTasks: boolean
  includeTeam: boolean
  includeFiles: boolean
  includeCalendar: boolean
  includeAnalytics: boolean
  format: "zip" | "folder"
  compression: "none" | "standard" | "maximum"
}

interface BulkExportManagerProps {
  isOpen: boolean
  onClose: () => void
  onExport: (options: BulkExportOptions) => void
}

export default function BulkExportManager({ isOpen, onClose, onExport }: BulkExportManagerProps) {
  const [exportOptions, setExportOptions] = useState<BulkExportOptions>({
    includeProjects: true,
    includeTasks: true,
    includeTeam: true,
    includeFiles: false,
    includeCalendar: true,
    includeAnalytics: true,
    format: "zip",
    compression: "standard",
  })

  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Simulate export progress
      const steps = Object.values(exportOptions).filter((v) => v === true).length
      let currentStep = 0

      const progressInterval = setInterval(() => {
        currentStep++
        setExportProgress((currentStep / steps) * 100)
        if (currentStep >= steps) {
          clearInterval(progressInterval)
        }
      }, 500)

      await onExport(exportOptions)
      setTimeout(() => {
        setIsExporting(false)
        setExportProgress(0)
        onClose()
      }, 2000)
    } catch (error) {
      console.error("Bulk export failed:", error)
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const exportSections = [
    {
      key: "includeProjects" as keyof BulkExportOptions,
      title: "Projects",
      description: "Project details, status, and progress",
      icon: "📁",
      estimatedSize: "~500 KB",
    },
    {
      key: "includeTasks" as keyof BulkExportOptions,
      title: "Tasks",
      description: "Task assignments, status, and timelines",
      icon: "✅",
      estimatedSize: "~300 KB",
    },
    {
      key: "includeTeam" as keyof BulkExportOptions,
      title: "Team Data",
      description: "Member profiles and performance metrics",
      icon: "👥",
      estimatedSize: "~200 KB",
    },
    {
      key: "includeFiles" as keyof BulkExportOptions,
      title: "File Metadata",
      description: "File organization and sharing information",
      icon: "📄",
      estimatedSize: "~100 KB",
    },
    {
      key: "includeCalendar" as keyof BulkExportOptions,
      title: "Calendar Events",
      description: "Meetings, deadlines, and milestones",
      icon: "📅",
      estimatedSize: "~150 KB",
    },
    {
      key: "includeAnalytics" as keyof BulkExportOptions,
      title: "Analytics Reports",
      description: "Performance metrics and insights",
      icon: "📊",
      estimatedSize: "~400 KB",
    },
  ]

  const selectedCount = exportSections.filter((section) => exportOptions[section.key] as boolean).length
  const totalEstimatedSize = selectedCount * 250 // Rough estimate in KB

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 text-white max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Bulk Workspace Export</DialogTitle>
          <DialogDescription className="text-white/70">
            Export your entire workspace data in a comprehensive package
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Sections */}
          <div className="space-y-3">
            <Label className="text-white font-medium">Select Data to Export</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exportSections.map((section) => (
                <label
                  key={section.key}
                  className="flex items-start gap-3 p-4 glass rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={exportOptions[section.key] as boolean}
                    onChange={(e) => setExportOptions({ ...exportOptions, [section.key]: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{section.icon}</span>
                      <div className="font-medium text-white">{section.title}</div>
                    </div>
                    <div className="text-white/60 text-sm mt-1">{section.description}</div>
                    <div className="text-white/50 text-xs mt-1">{section.estimatedSize}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Export Format */}
          <div className="space-y-3">
            <Label className="text-white font-medium">Export Format</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportOptions({ ...exportOptions, format: "zip" })}
                className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                  exportOptions.format === "zip"
                    ? "gradient-primary border-white/30 shadow-lg"
                    : "glass border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🗜️</span>
                  <div>
                    <div className="font-medium text-white">ZIP Archive</div>
                    <div className="text-xs text-white/60">Compressed single file download</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setExportOptions({ ...exportOptions, format: "folder" })}
                className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                  exportOptions.format === "folder"
                    ? "gradient-primary border-white/30 shadow-lg"
                    : "glass border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📁</span>
                  <div>
                    <div className="font-medium text-white">Folder Structure</div>
                    <div className="text-xs text-white/60">Organized files and folders</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Compression Level */}
          {exportOptions.format === "zip" && (
            <div className="space-y-3">
              <Label className="text-white font-medium">Compression Level</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "none", label: "None", description: "Fastest, larger file" },
                  { value: "standard", label: "Standard", description: "Balanced speed and size" },
                  { value: "maximum", label: "Maximum", description: "Smallest file, slower" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setExportOptions({ ...exportOptions, compression: option.value as any })}
                    className={`p-3 rounded-lg border transition-all duration-200 text-center ${
                      exportOptions.compression === option.value
                        ? "gradient-secondary border-white/30 shadow-lg"
                        : "glass border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="font-medium text-white text-sm">{option.label}</div>
                    <div className="text-xs text-white/60 mt-1">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Export Summary */}
          <div className="glass p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-white/70">Selected sections:</span>
              <span className="text-white font-medium">
                {selectedCount} of {exportSections.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-white/70">Estimated size:</span>
              <span className="text-white font-medium">
                ~
                {totalEstimatedSize > 1000
                  ? `${(totalEstimatedSize / 1000).toFixed(1)} MB`
                  : `${totalEstimatedSize} KB`}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/70">Export format:</span>
              <span className="text-white font-medium">
                {exportOptions.format.toUpperCase()}
                {exportOptions.format === "zip" && ` (${exportOptions.compression})`}
              </span>
            </div>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white font-medium">Export Progress</Label>
                <span className="text-white/70 text-sm">{Math.round(exportProgress)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="gradient-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
              <div className="text-center text-white/60 text-sm">
                {exportProgress < 100 ? "Preparing export package..." : "Export complete! Download starting..."}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isExporting}
              className="glass border-white/20 text-white bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || selectedCount === 0}
              className="gradient-primary text-white"
            >
              {isExporting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Exporting...
                </div>
              ) : (
                `Export Workspace (${selectedCount} sections)`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

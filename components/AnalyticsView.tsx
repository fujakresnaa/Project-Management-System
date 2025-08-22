"use client"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: "productivity" | "project" | "team" | "financial" | "custom"
  metrics: string[]
  chartType: "line" | "bar" | "pie" | "area" | "scatter"
  dateRange: string
  filters: Record<string, any>
}

interface CustomReport {
  id: string
  name: string
  description: string
  metrics: string[]
  chartType: "line" | "bar" | "pie" | "area" | "scatter"
  dateRange: string
  filters: Record<string, any>
  createdAt: string
  lastRun: string
  isScheduled: boolean
  scheduleFrequency?: "daily" | "weekly" | "monthly"
}

export default function AnalyticsView() {
  const [activeTab, setActiveTab] = useState<"overview" | "reports" | "builder" | "scheduled">("overview")
  const [showReportBuilder, setShowReportBuilder] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState("30d")
  const [selectedProject, setSelectedProject] = useState("all")

  const [customReports, setCustomReports] = useState<CustomReport[]>([
    {
      id: "1",
      name: "Team Productivity Report",
      description: "Weekly productivity metrics by team member",
      metrics: ["tasks_completed", "hours_logged", "projects_active"],
      chartType: "bar",
      dateRange: "7d",
      filters: { team: "engineering" },
      createdAt: "2024-02-15T10:00:00Z",
      lastRun: "2024-02-21T09:00:00Z",
      isScheduled: true,
      scheduleFrequency: "weekly",
    },
    {
      id: "2",
      name: "Project Timeline Analysis",
      description: "Project completion trends and timeline accuracy",
      metrics: ["project_completion", "timeline_variance", "milestone_hits"],
      chartType: "line",
      dateRange: "90d",
      filters: { status: "completed" },
      createdAt: "2024-02-10T14:30:00Z",
      lastRun: "2024-02-20T16:45:00Z",
      isScheduled: false,
    },
  ])

  const reportTemplates: ReportTemplate[] = [
    {
      id: "1",
      name: "Executive Dashboard",
      description: "High-level overview of all projects and team performance",
      type: "productivity",
      metrics: ["project_completion_rate", "team_utilization", "budget_variance"],
      chartType: "area",
      dateRange: "30d",
      filters: {},
    },
    {
      id: "2",
      name: "Project Performance",
      description: "Detailed analysis of individual project metrics",
      type: "project",
      metrics: ["task_completion", "timeline_adherence", "resource_allocation"],
      chartType: "bar",
      dateRange: "60d",
      filters: {},
    },
    {
      id: "3",
      name: "Team Efficiency",
      description: "Team productivity and collaboration metrics",
      type: "team",
      metrics: ["tasks_per_member", "collaboration_score", "response_time"],
      chartType: "line",
      dateRange: "14d",
      filters: {},
    },
    {
      id: "4",
      name: "Financial Overview",
      description: "Budget tracking and cost analysis",
      type: "financial",
      metrics: ["budget_utilization", "cost_per_project", "roi_analysis"],
      chartType: "pie",
      dateRange: "90d",
      filters: {},
    },
  ]

  const [newReport, setNewReport] = useState<Partial<CustomReport>>({
    name: "",
    description: "",
    metrics: [],
    chartType: "bar",
    dateRange: "30d",
    filters: {},
  })

  const availableMetrics = [
    { id: "tasks_completed", label: "Tasks Completed", category: "productivity" },
    { id: "hours_logged", label: "Hours Logged", category: "productivity" },
    { id: "projects_active", label: "Active Projects", category: "project" },
    { id: "project_completion_rate", label: "Project Completion Rate", category: "project" },
    { id: "team_utilization", label: "Team Utilization", category: "team" },
    { id: "budget_variance", label: "Budget Variance", category: "financial" },
    { id: "timeline_adherence", label: "Timeline Adherence", category: "project" },
    { id: "collaboration_score", label: "Collaboration Score", category: "team" },
    { id: "response_time", label: "Response Time", category: "team" },
    { id: "roi_analysis", label: "ROI Analysis", category: "financial" },
  ]

  const createReportFromTemplate = (template: ReportTemplate) => {
    const newReport: CustomReport = {
      id: Date.now().toString(),
      name: template.name,
      description: template.description,
      metrics: template.metrics,
      chartType: template.chartType,
      dateRange: template.dateRange,
      filters: template.filters,
      createdAt: new Date().toISOString(),
      lastRun: new Date().toISOString(),
      isScheduled: false,
    }
    setCustomReports([...customReports, newReport])
  }

  const createCustomReport = () => {
    if (!newReport.name || !newReport.metrics?.length) return

    const report: CustomReport = {
      id: Date.now().toString(),
      name: newReport.name!,
      description: newReport.description || "",
      metrics: newReport.metrics!,
      chartType: newReport.chartType!,
      dateRange: newReport.dateRange!,
      filters: newReport.filters!,
      createdAt: new Date().toISOString(),
      lastRun: new Date().toISOString(),
      isScheduled: false,
    }

    setCustomReports([...customReports, report])
    setNewReport({
      name: "",
      description: "",
      metrics: [],
      chartType: "bar",
      dateRange: "30d",
      filters: {},
    })
    setShowReportBuilder(false)
  }

  const exportReport = (format: "pdf" | "excel" | "csv") => {
    // Simulate export functionality
    console.log(`Exporting report in ${format} format`)
    setShowExportDialog(false)
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "reports", label: "Custom Reports", icon: "📈" },
    { id: "builder", label: "Report Builder", icon: "🔧" },
    { id: "scheduled", label: "Scheduled Reports", icon: "⏰" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Advanced Analytics</h1>
          <p className="text-white/70">Comprehensive reporting and data insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="w-32 glass border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/10">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => setShowExportDialog(true)}
            variant="outline"
            className="glass border-white/20 text-white hover:bg-white/10"
          >
            Export
          </Button>
          <Button onClick={() => setShowReportBuilder(true)} className="gradient-primary text-white">
            Create Report
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 glass-card p-1 rounded-lg border border-white/10 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? "gradient-primary text-white shadow-lg"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Total Projects</p>
                    <p className="text-2xl font-bold text-white">24</p>
                    <p className="text-green-400 text-sm">+12% from last month</p>
                  </div>
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">📁</div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Completion Rate</p>
                    <p className="text-2xl font-bold text-white">87%</p>
                    <p className="text-green-400 text-sm">+5% from last month</p>
                  </div>
                  <div className="w-12 h-12 gradient-secondary rounded-lg flex items-center justify-center">✅</div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Team Efficiency</p>
                    <p className="text-2xl font-bold text-white">92%</p>
                    <p className="text-green-400 text-sm">+3% from last month</p>
                  </div>
                  <div className="w-12 h-12 gradient-accent rounded-lg flex items-center justify-center">👥</div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Budget Utilization</p>
                    <p className="text-2xl font-bold text-white">78%</p>
                    <p className="text-yellow-400 text-sm">-2% from last month</p>
                  </div>
                  <div className="w-12 h-12 gradient-warning rounded-lg flex items-center justify-center">💰</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Project Progress Trends</CardTitle>
                <CardDescription className="text-white/70">Monthly project completion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-white/50">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📈</div>
                    <p>Interactive Line Chart</p>
                    <p className="text-sm">Project completion trends over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Resource Allocation</CardTitle>
                <CardDescription className="text-white/70">Team workload distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-white/50">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🥧</div>
                    <p>Interactive Pie Chart</p>
                    <p className="text-sm">Resource allocation by department</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Task Velocity</CardTitle>
                <CardDescription className="text-white/70">Tasks completed per sprint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-white/50">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <p>Interactive Bar Chart</p>
                    <p className="text-sm">Sprint velocity and task completion</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Budget vs Actual</CardTitle>
                <CardDescription className="text-white/70">Financial performance tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-white/50">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📉</div>
                    <p>Interactive Area Chart</p>
                    <p className="text-sm">Budget variance analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Custom Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customReports.map((report) => (
              <Card key={report.id} className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">{report.name}</CardTitle>
                      <CardDescription className="text-white/70">{report.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {report.isScheduled && <span className="w-2 h-2 bg-green-400 rounded-full"></span>}
                      <Button size="sm" variant="ghost" className="text-white/70 hover:text-white">
                        ⋯
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <span>📊</span>
                    <span>{report.chartType} chart</span>
                    <span>•</span>
                    <span>{report.dateRange}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {report.metrics.slice(0, 3).map((metric) => (
                      <span key={metric} className="px-2 py-1 bg-white/10 rounded text-xs text-white/80">
                        {metric.replace(/_/g, " ")}
                      </span>
                    ))}
                    {report.metrics.length > 3 && (
                      <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/80">
                        +{report.metrics.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-white/50">Last run: {new Date(report.lastRun).toLocaleDateString()}</div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 gradient-primary text-white">
                      Run Report
                    </Button>
                    <Button size="sm" variant="outline" className="glass border-white/20 text-white bg-transparent">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Report Builder Tab */}
      {activeTab === "builder" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Templates */}
            <div className="lg:col-span-1">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Report Templates</CardTitle>
                  <CardDescription className="text-white/70">Start with a pre-built template</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reportTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="p-3 glass rounded-lg border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                      onClick={() => createReportFromTemplate(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-white font-medium text-sm">{template.name}</h4>
                          <p className="text-white/60 text-xs mt-1">{template.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/80">{template.type}</span>
                            <span className="text-white/50 text-xs">{template.metrics.length} metrics</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Custom Report Builder */}
            <div className="lg:col-span-2">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Custom Report Builder</CardTitle>
                  <CardDescription className="text-white/70">
                    Create a custom report with your preferred metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Report Name</Label>
                      <Input
                        value={newReport.name || ""}
                        onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                        placeholder="Enter report name"
                        className="glass border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Chart Type</Label>
                      <Select
                        value={newReport.chartType}
                        onValueChange={(value) => setNewReport({ ...newReport, chartType: value as any })}
                      >
                        <SelectTrigger className="glass border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/10">
                          <SelectItem value="bar">Bar Chart</SelectItem>
                          <SelectItem value="line">Line Chart</SelectItem>
                          <SelectItem value="pie">Pie Chart</SelectItem>
                          <SelectItem value="area">Area Chart</SelectItem>
                          <SelectItem value="scatter">Scatter Plot</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Description</Label>
                    <Input
                      value={newReport.description || ""}
                      onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                      placeholder="Enter report description"
                      className="glass border-white/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Select Metrics</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {availableMetrics.map((metric) => (
                        <label
                          key={metric.id}
                          className="flex items-center gap-2 p-2 glass rounded cursor-pointer hover:bg-white/10"
                        >
                          <input
                            type="checkbox"
                            checked={newReport.metrics?.includes(metric.id) || false}
                            onChange={(e) => {
                              const metrics = newReport.metrics || []
                              if (e.target.checked) {
                                setNewReport({ ...newReport, metrics: [...metrics, metric.id] })
                              } else {
                                setNewReport({ ...newReport, metrics: metrics.filter((m) => m !== metric.id) })
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <div>
                            <span className="text-white text-sm">{metric.label}</span>
                            <span className="text-white/50 text-xs ml-2">({metric.category})</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Date Range</Label>
                      <Select
                        value={newReport.dateRange}
                        onValueChange={(value) => setNewReport({ ...newReport, dateRange: value })}
                      >
                        <SelectTrigger className="glass border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/10">
                          <SelectItem value="7d">Last 7 days</SelectItem>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                          <SelectItem value="90d">Last 90 days</SelectItem>
                          <SelectItem value="1y">Last year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="glass border-white/20 text-white bg-transparent"
                      onClick={() =>
                        setNewReport({
                          name: "",
                          description: "",
                          metrics: [],
                          chartType: "bar",
                          dateRange: "30d",
                          filters: {},
                        })
                      }
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={createCustomReport}
                      className="gradient-primary text-white"
                      disabled={!newReport.name || !newReport.metrics?.length}
                    >
                      Create Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Reports Tab */}
      {activeTab === "scheduled" && (
        <div className="space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Scheduled Reports</CardTitle>
              <CardDescription className="text-white/70">
                Manage automated report generation and delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customReports
                  .filter((r) => r.isScheduled)
                  .map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 glass rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">⏰</div>
                        <div>
                          <h4 className="text-white font-medium">{report.name}</h4>
                          <p className="text-white/60 text-sm">
                            Runs {report.scheduleFrequency} • Last run: {new Date(report.lastRun).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span className="text-green-400 text-sm">Active</span>
                        <Button size="sm" variant="ghost" className="text-white/70 hover:text-white ml-2">
                          ⋯
                        </Button>
                      </div>
                    </div>
                  ))}

                {customReports.filter((r) => r.isScheduled).length === 0 && (
                  <div className="text-center py-8 text-white/50">
                    <div className="text-4xl mb-2">📅</div>
                    <p>No scheduled reports</p>
                    <p className="text-sm">Create a report and enable scheduling to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="glass-card border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Export Report</DialogTitle>
            <DialogDescription className="text-white/70">Choose the format for your report export</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => exportReport("pdf")}
                variant="outline"
                className="glass border-white/20 text-white hover:bg-white/10 h-20 flex-col"
              >
                <div className="text-2xl mb-1">📄</div>
                <span>PDF</span>
              </Button>
              <Button
                onClick={() => exportReport("excel")}
                variant="outline"
                className="glass border-white/20 text-white hover:bg-white/10 h-20 flex-col"
              >
                <div className="text-2xl mb-1">📊</div>
                <span>Excel</span>
              </Button>
              <Button
                onClick={() => exportReport("csv")}
                variant="outline"
                className="glass border-white/20 text-white hover:bg-white/10 h-20 flex-col"
              >
                <div className="text-2xl mb-1">📋</div>
                <span>CSV</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Builder Dialog */}
      <Dialog open={showReportBuilder} onOpenChange={setShowReportBuilder}>
        <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quick Report Builder</DialogTitle>
            <DialogDescription className="text-white/70">Create a new custom report quickly</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Report Name</Label>
              <Input
                value={newReport.name || ""}
                onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                placeholder="Enter report name"
                className="glass border-white/20 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Chart Type</Label>
                <Select
                  value={newReport.chartType}
                  onValueChange={(value) => setNewReport({ ...newReport, chartType: value as any })}
                >
                  <SelectTrigger className="glass border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select
                  value={newReport.dateRange}
                  onValueChange={(value) => setNewReport({ ...newReport, dateRange: value })}
                >
                  <SelectTrigger className="glass border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10">
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowReportBuilder(false)}
                className="glass border-white/20 text-white"
              >
                Cancel
              </Button>
              <Button onClick={createCustomReport} className="gradient-primary text-white" disabled={!newReport.name}>
                Create Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import Dashboard from "@/components/Dashboard"
import ProjectsView from "@/components/ProjectsView"
import TasksView from "@/components/TasksView"
import TeamView from "@/components/TeamView"
import AnalyticsView from "@/components/AnalyticsView"
import FilesView from "@/components/FilesView" // Import FilesView component
import CalendarView from "@/components/CalendarView" // Import CalendarView component
import ExportManager from "@/components/ExportManager"
import BulkExportManager from "@/components/BulkExportManager"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Project {
  id: string
  name: string
  description: string
  status: "planning" | "active" | "completed" | "archived"
  priority: "low" | "medium" | "high" | "critical"
  progress: number
  startDate: string
  endDate: string
  teamMembers: number
  budget?: number
}

interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "review" | "done"
  priority: "low" | "medium" | "high" | "critical"
  assignedTo: string
  projectId: string
  projectName: string
  dueDate: string
  estimatedHours?: number
  actualHours?: number
  tags: string[]
  comments: number
  attachments: number
  subtasks?: Task[]
  createdAt: string
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: "admin" | "manager" | "member"
  avatar: string
  status: "online" | "away" | "offline"
  department: string
  joinDate: string
  tasksCompleted: number
  activeProjects: number
  skills: string[]
  lastActive: string
}

interface Activity {
  id: string
  type: "task_created" | "task_completed" | "project_updated" | "comment_added" | "file_uploaded" | "member_joined"
  user: string
  userAvatar: string
  description: string
  timestamp: string
  projectName?: string
  taskName?: string
}

interface ChatMessage {
  id: string
  sender: string
  senderAvatar: string
  message: string
  timestamp: string
  type: "text" | "file" | "system"
  fileName?: string
}

interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  userId?: string
}

interface FileItem {
  id: string
  name: string
  type: "folder" | "file"
  fileType?: "document" | "image" | "video" | "audio" | "archive" | "other"
  size?: number
  uploadedBy: string
  uploadedAt: string
  modifiedAt: string
  projectId?: string
  projectName?: string
  parentFolderId?: string
  isShared: boolean
  permissions: "view" | "edit" | "admin"
  tags: string[]
  version: number
  url?: string
  thumbnail?: string
}

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  date: string
  type: "meeting" | "deadline" | "milestone" | "personal" | "reminder"
  projectId?: string
  projectName?: string
  attendees?: string[]
  location?: string
  isAllDay: boolean
  color: string
  createdBy: string
}

export default function AvenciaApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentView, setCurrentView] = useState<
    "dashboard" | "projects" | "tasks" | "team" | "analytics" | "files" | "calendar" | "settings"
  >("dashboard")
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "Task Completed",
      message: "Database optimization has been completed successfully",
      timestamp: "2024-02-21T10:30:00Z",
      read: false,
      actionUrl: "/tasks/db-optimization",
    },
    {
      id: "2",
      type: "info",
      title: "New Comment",
      message: "Sarah Chen commented on your wireframe design",
      timestamp: "2024-02-21T09:15:00Z",
      read: false,
      actionUrl: "/projects/website-redesign",
    },
    {
      id: "3",
      type: "warning",
      title: "Deadline Approaching",
      message: "Mobile App Development milestone due in 2 days",
      timestamp: "2024-02-21T08:00:00Z",
      read: true,
      actionUrl: "/projects/mobile-app",
    },
  ])
  const [showNotifications, setShowNotifications] = useState(false)
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "1",
      name: "Project Documents",
      type: "folder",
      uploadedBy: "Alex Rodriguez",
      uploadedAt: "2024-02-15T10:00:00Z",
      modifiedAt: "2024-02-21T14:30:00Z",
      projectId: "1",
      projectName: "Website Redesign",
      isShared: true,
      permissions: "admin",
      tags: ["documents", "project"],
      version: 1,
    },
    {
      id: "2",
      name: "wireframes-v2.fig",
      type: "file",
      fileType: "other",
      size: 2048000,
      uploadedBy: "Sarah Chen",
      uploadedAt: "2024-02-20T09:15:00Z",
      modifiedAt: "2024-02-21T11:20:00Z",
      projectId: "1",
      projectName: "Website Redesign",
      parentFolderId: "1",
      isShared: true,
      permissions: "edit",
      tags: ["design", "wireframes"],
      version: 2,
      url: "/files/wireframes-v2.fig",
    },
    {
      id: "3",
      name: "homepage-mockup.png",
      type: "file",
      fileType: "image",
      size: 1536000,
      uploadedBy: "Emma Wilson",
      uploadedAt: "2024-02-19T16:45:00Z",
      modifiedAt: "2024-02-19T16:45:00Z",
      projectId: "1",
      projectName: "Website Redesign",
      parentFolderId: "1",
      isShared: false,
      permissions: "view",
      tags: ["design", "mockup"],
      version: 1,
      url: "/files/homepage-mockup.png",
      thumbnail: "/homepage-mockup.png",
    },
    {
      id: "4",
      name: "project-requirements.pdf",
      type: "file",
      fileType: "document",
      size: 512000,
      uploadedBy: "Mike Johnson",
      uploadedAt: "2024-02-18T14:20:00Z",
      modifiedAt: "2024-02-20T10:15:00Z",
      projectId: "2",
      projectName: "Mobile App Development",
      parentFolderId: "1",
      isShared: true,
      permissions: "edit",
      tags: ["requirements", "documentation"],
      version: 3,
      url: "/files/project-requirements.pdf",
    },
  ])

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Project Kickoff Meeting",
      description: "Initial meeting to discuss project requirements and timeline",
      startTime: "09:00",
      endTime: "10:30",
      date: "2024-02-22",
      type: "meeting",
      projectId: "1",
      projectName: "Website Redesign",
      attendees: ["Sarah Chen", "Mike Johnson", "Emma Wilson"],
      location: "Conference Room A",
      isAllDay: false,
      color: "bg-blue-500",
      createdBy: "Alex Rodriguez",
    },
    {
      id: "2",
      title: "Design Review Deadline",
      description: "Final deadline for design review and approval",
      startTime: "17:00",
      endTime: "17:00",
      date: "2024-02-25",
      type: "deadline",
      projectId: "1",
      projectName: "Website Redesign",
      isAllDay: false,
      color: "bg-red-500",
      createdBy: "Sarah Chen",
    },
    {
      id: "3",
      title: "Sprint Planning",
      description: "Plan tasks for the upcoming sprint",
      startTime: "14:00",
      endTime: "16:00",
      date: "2024-02-26",
      type: "meeting",
      projectId: "2",
      projectName: "Mobile App Development",
      attendees: ["Alex Rodriguez", "Mike Johnson", "Lisa Park"],
      location: "Virtual Meeting",
      isAllDay: false,
      color: "bg-purple-500",
      createdBy: "Lisa Park",
    },
    {
      id: "4",
      title: "Q1 Milestone Review",
      startTime: "00:00",
      endTime: "23:59",
      date: "2024-02-28",
      type: "milestone",
      projectId: "3",
      projectName: "Marketing Campaign",
      isAllDay: true,
      color: "bg-green-500",
      createdBy: "Emma Wilson",
    },
  ])

  const [userSettings, setUserSettings] = useState({
    profile: {
      name: "Alex Rodriguez",
      email: "alex@avencia.com",
      avatar: "/professional-man-avatar.png",
      title: "Project Manager",
      department: "Engineering",
      timezone: "America/New_York",
      language: "en",
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      taskReminders: true,
      projectUpdates: true,
      teamMentions: true,
      weeklyDigest: false,
    },
    privacy: {
      profileVisibility: "team" as "public" | "team" | "private",
      showOnlineStatus: true,
      allowDirectMessages: true,
      shareActivity: true,
    },
    appearance: {
      theme: "dark" as "light" | "dark" | "auto",
      compactMode: false,
      showAvatars: true,
      animationsEnabled: true,
    },
    workspace: {
      defaultView: "dashboard" as "dashboard" | "projects" | "tasks",
      itemsPerPage: 20,
      autoSave: true,
      showCompletedTasks: false,
    },
  })

  const [showExportManager, setShowExportManager] = useState(false)
  const [showBulkExportManager, setShowBulkExportManager] = useState(false)
  const [exportType, setExportType] = useState<
    "projects" | "tasks" | "team" | "files" | "calendar" | "analytics" | "workspace"
  >("projects")

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const handleExport = async (options: any) => {
    console.log(`Exporting ${exportType} with options:`, options)

    // Simulate export process
    const exportData = {
      projects: [],
      tasks: [],
      team: [],
      files: files,
      calendar: calendarEvents,
      analytics: [],
      workspace: { projects: [], tasks: [], team: [], files, calendar: calendarEvents },
    }

    const dataToExport = exportData[exportType]

    // Create and download file
    const filename = `avencia-${exportType}-export-${new Date().toISOString().split("T")[0]}.${options.format}`

    if (options.format === "json") {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
      downloadFile(blob, filename)
    } else if (options.format === "csv") {
      const csvContent = convertToCSV(dataToExport)
      const blob = new Blob([csvContent], { type: "text/csv" })
      downloadFile(blob, filename)
    } else {
      // For PDF and Excel, simulate the export
      const blob = new Blob([`${exportType} export data`], { type: "text/plain" })
      downloadFile(blob, filename)
    }
  }

  const handleBulkExport = async (options: any) => {
    console.log("Bulk exporting workspace with options:", options)

    const workspaceData = {
      projects: options.includeProjects ? [] : undefined,
      tasks: options.includeTasks ? [] : undefined,
      team: options.includeTeam ? [] : undefined,
      files: options.includeFiles ? files : undefined,
      calendar: options.includeCalendar ? calendarEvents : undefined,
      analytics: options.includeAnalytics ? [] : undefined,
      exportedAt: new Date().toISOString(),
      exportOptions: options,
    }

    const filename = `avencia-workspace-export-${new Date().toISOString().split("T")[0]}.json`
    const blob = new Blob([JSON.stringify(workspaceData, null, 2)], { type: "application/json" })
    downloadFile(blob, filename)
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const convertToCSV = (data: any[]) => {
    if (!data || data.length === 0) return ""

    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
          })
          .join(","),
      ),
    ]

    return csvRows.join("\n")
  }

  const openExportManager = (type: typeof exportType) => {
    setExportType(type)
    setShowExportManager(true)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 rounded-2xl border border-white/10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Avencia
              </h1>
              <p className="text-slate-400">Modern Project Management Platform</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                />
              </div>
              <Button
                onClick={() => setIsAuthenticated(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Header onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="p-4 lg:p-6">
          {currentView === "dashboard" && <Dashboard onExport={() => openExportManager("workspace")} />}
          {currentView === "projects" && <ProjectsView onExport={() => openExportManager("projects")} />}
          {currentView === "tasks" && <TasksView onExport={() => openExportManager("tasks")} />}
          {currentView === "team" && <TeamView onExport={() => openExportManager("team")} />}
          {currentView === "analytics" && <AnalyticsView />}
          {currentView === "files" && (
            <FilesView files={files} onFilesChange={setFiles} onExport={() => openExportManager("files")} />
          )}
          {currentView === "calendar" && (
            <CalendarView
              events={calendarEvents}
              onEventsChange={setCalendarEvents}
              onExport={() => openExportManager("calendar")}
            />
          )}
          {currentView === "settings" && <SettingsView settings={userSettings} onSettingsChange={setUserSettings} />}
        </main>
      </div>

      {/* Export Manager Dialogs */}
      <ExportManager
        isOpen={showExportManager}
        onClose={() => setShowExportManager(false)}
        exportType={exportType}
        data={exportType === "files" ? files : exportType === "calendar" ? calendarEvents : []}
        onExport={handleExport}
      />

      <BulkExportManager
        isOpen={showBulkExportManager}
        onClose={() => setShowBulkExportManager(false)}
        onExport={handleBulkExport}
      />

      {/* Floating Export Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <Button
          onClick={() => setShowBulkExportManager(true)}
          className="gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full w-14 h-14 p-0"
          title="Bulk Export Workspace"
        >
          <span className="text-xl">📤</span>
        </Button>
      </div>
    </div>
  )
}

function SettingsView({
  settings,
  onSettingsChange,
}: {
  settings: any
  onSettingsChange: (settings: any) => void
}) {
  const [activeTab, setActiveTab] = useState<
    "profile" | "notifications" | "privacy" | "appearance" | "workspace" | "security"
  >("profile")
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  const updateSettings = (section: string, updates: any) => {
    onSettingsChange({
      ...settings,
      [section]: {
        ...settings[section],
        ...updates,
      },
    })
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "privacy", label: "Privacy", icon: "🔒" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "workspace", label: "Workspace", icon: "⚙️" },
    { id: "security", label: "Security", icon: "🛡️" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/70">Manage your account preferences and workspace settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card className="glass-card border-white/10 lg:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                    activeTab === tab.id
                      ? "gradient-primary text-white shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Settings */}
          {activeTab === "profile" && (
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
                <CardDescription className="text-white/70">
                  Update your personal information and profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src={settings.profile.avatar || "/placeholder.svg"}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
                    />
                    <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 gradient-primary">
                      ✏️
                    </Button>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Profile Picture</h3>
                    <p className="text-white/60 text-sm">Upload a new avatar for your profile</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 glass border-white/20 text-white bg-transparent"
                    >
                      Change Avatar
                    </Button>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={settings.profile.name}
                      onChange={(e) => updateSettings("profile", { name: e.target.value })}
                      className="glass border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => updateSettings("profile", { email: e.target.value })}
                      className="glass border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">
                      Job Title
                    </Label>
                    <Input
                      id="title"
                      value={settings.profile.title}
                      onChange={(e) => updateSettings("profile", { title: e.target.value })}
                      className="glass border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-white">
                      Department
                    </Label>
                    <Input
                      id="department"
                      value={settings.profile.department}
                      onChange={(e) => updateSettings("profile", { department: e.target.value })}
                      className="glass border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-white">
                      Timezone
                    </Label>
                    <Select
                      value={settings.profile.timezone}
                      onValueChange={(value) => updateSettings("profile", { timezone: value })}
                    >
                      <SelectTrigger className="glass border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-white">
                      Language
                    </Label>
                    <Select
                      value={settings.profile.language}
                      onValueChange={(value) => updateSettings("profile", { language: value })}
                    >
                      <SelectTrigger className="glass border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="gradient-primary text-white">Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications Settings */}
          {activeTab === "notifications" && (
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Notification Preferences</CardTitle>
                <CardDescription className="text-white/70">
                  Choose how you want to be notified about updates and activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Email Notifications</h4>
                      <p className="text-white/60 text-sm">Receive notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => updateSettings("notifications", { emailNotifications: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Push Notifications</h4>
                      <p className="text-white/60 text-sm">Receive browser push notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.pushNotifications}
                      onChange={(e) => updateSettings("notifications", { pushNotifications: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Task Reminders</h4>
                      <p className="text-white/60 text-sm">Get reminded about upcoming task deadlines</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.taskReminders}
                      onChange={(e) => updateSettings("notifications", { taskReminders: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Project Updates</h4>
                      <p className="text-white/60 text-sm">Notifications when projects are updated</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.projectUpdates}
                      onChange={(e) => updateSettings("notifications", { projectUpdates: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Team Mentions</h4>
                      <p className="text-white/60 text-sm">Get notified when someone mentions you</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.teamMentions}
                      onChange={(e) => updateSettings("notifications", { teamMentions: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Weekly Digest</h4>
                      <p className="text-white/60 text-sm">Receive a weekly summary of your activity</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.weeklyDigest}
                      onChange={(e) => updateSettings("notifications", { weeklyDigest: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Settings */}
          {activeTab === "privacy" && (
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Privacy Settings</CardTitle>
                <CardDescription className="text-white/70">
                  Control your privacy and visibility settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Profile Visibility</Label>
                    <Select
                      value={settings.privacy.profileVisibility}
                      onValueChange={(value) => updateSettings("privacy", { profileVisibility: value })}
                    >
                      <SelectTrigger className="glass border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="public">Public - Visible to everyone</SelectItem>
                        <SelectItem value="team">Team - Visible to team members only</SelectItem>
                        <SelectItem value="private">Private - Only visible to you</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Show Online Status</h4>
                      <p className="text-white/60 text-sm">Let others see when you&apos;re online</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.privacy.showOnlineStatus}
                      onChange={(e) => updateSettings("privacy", { showOnlineStatus: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Allow Direct Messages</h4>
                      <p className="text-white/60 text-sm">Allow team members to send you direct messages</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.privacy.allowDirectMessages}
                      onChange={(e) => updateSettings("privacy", { allowDirectMessages: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Share Activity</h4>
                      <p className="text-white/60 text-sm">Share your activity in team feeds</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.privacy.shareActivity}
                      onChange={(e) => updateSettings("privacy", { shareActivity: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appearance Settings */}
          {activeTab === "appearance" && (
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Appearance</CardTitle>
                <CardDescription className="text-white/70">
                  Customize the look and feel of your workspace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Theme</Label>
                    <Select
                      value={settings.appearance.theme}
                      onValueChange={(value) => updateSettings("appearance", { theme: value })}
                    >
                      <SelectTrigger className="glass border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto (System)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Compact Mode</h4>
                      <p className="text-white/60 text-sm">Use a more compact layout to fit more content</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.appearance.compactMode}
                      onChange={(e) => updateSettings("appearance", { compactMode: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Show Avatars</h4>
                      <p className="text-white/60 text-sm">Display user avatars throughout the interface</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.appearance.showAvatars}
                      onChange={(e) => updateSettings("appearance", { showAvatars: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Animations</h4>
                      <p className="text-white/60 text-sm">Enable smooth animations and transitions</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.appearance.animationsEnabled}
                      onChange={(e) => updateSettings("appearance", { animationsEnabled: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Workspace Settings */}
          {activeTab === "workspace" && (
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Workspace Preferences</CardTitle>
                <CardDescription className="text-white/70">
                  Configure your workspace behavior and defaults
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Default View</Label>
                    <Select
                      value={settings.workspace.defaultView}
                      onValueChange={(value) => updateSettings("workspace", { defaultView: value })}
                    >
                      <SelectTrigger className="glass border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="dashboard">Dashboard</SelectItem>
                        <SelectItem value="projects">Projects</SelectItem>
                        <SelectItem value="tasks">Tasks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Items Per Page</Label>
                    <Select
                      value={settings.workspace.itemsPerPage.toString()}
                      onValueChange={(value) => updateSettings("workspace", { itemsPerPage: Number.parseInt(value) })}
                    >
                      <SelectTrigger className="glass border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Auto Save</h4>
                      <p className="text-white/60 text-sm">Automatically save changes as you work</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.workspace.autoSave}
                      onChange={(e) => updateSettings("workspace", { autoSave: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Show Completed Tasks</h4>
                      <p className="text-white/60 text-sm">Display completed tasks in task lists</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.workspace.showCompletedTasks}
                      onChange={(e) => updateSettings("workspace", { showCompletedTasks: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Security</CardTitle>
                <CardDescription className="text-white/70">
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 glass rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Password</h4>
                      <p className="text-white/60 text-sm">Last changed 3 months ago</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordDialog(true)}
                      className="glass border-white/20 text-white hover:bg-white/10"
                    >
                      Change Password
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 glass rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                      <p className="text-white/60 text-sm">Add an extra layer of security to your account</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="glass border-white/20 text-white hover:bg-white/10 bg-transparent"
                    >
                      Enable 2FA
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 glass rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Active Sessions</h4>
                      <p className="text-white/60 text-sm">Manage your active login sessions</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="glass border-white/20 text-white hover:bg-white/10 bg-transparent"
                    >
                      View Sessions
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 glass rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">API Keys</h4>
                      <p className="text-white/60 text-sm">Manage API keys for integrations</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="glass border-white/20 text-white hover:bg-white/10 bg-transparent"
                    >
                      Manage Keys
                    </Button>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <div className="space-y-4">
                    <h4 className="text-white font-medium text-red-400">Danger Zone</h4>
                    <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-lg bg-red-500/5">
                      <div>
                        <h4 className="text-white font-medium">Delete Account</h4>
                        <p className="text-white/60 text-sm">Permanently delete your account and all data</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="glass-card border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription className="text-white/70">
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" className="glass border-white/20 text-white" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" className="glass border-white/20 text-white" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" className="glass border-white/20 text-white" required />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
                className="glass border-white/20 text-white"
              >
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary text-white">
                Update Password
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  BarChart3,
  FileText,
  Calendar,
  Settings,
  X,
} from "lucide-react"

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
  isMobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ currentView, onViewChange, isMobileOpen, onMobileClose }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null },
    { id: "projects", label: "Projects", icon: FolderOpen, badge: "12" },
    { id: "tasks", label: "Tasks", icon: CheckSquare, badge: "24" },
    { id: "team", label: "Team", icon: Users, badge: null },
    { id: "analytics", label: "Analytics", icon: BarChart3, badge: null },
    { id: "files", label: "Files", icon: FileText, badge: "156" },
    { id: "calendar", label: "Calendar", icon: Calendar, badge: "3" },
    { id: "settings", label: "Settings", icon: Settings, badge: null },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onMobileClose} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 h-full w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 z-50 lg:z-30
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-white font-semibold text-lg">Avencia</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-white hover:bg-white/10"
              onClick={onMobileClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`
                    w-full justify-start text-left h-12 px-4 rounded-xl transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }
                  `}
                  onClick={() => {
                    onViewChange(item.id)
                    onMobileClose()
                  }}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="ml-auto bg-purple-500/20 text-purple-300 border-purple-500/30"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <div className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">JD</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">John Doe</p>
                    <p className="text-gray-400 text-xs truncate">Project Manager</p>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

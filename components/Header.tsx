"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Menu, Search, Bell, Settings, Plus, ChevronDown } from "lucide-react"
import { useState } from "react"

interface HeaderProps {
  onMobileMenuClick: () => void
}

export default function Header({ onMobileMenuClick }: HeaderProps) {
  const [notifications] = useState([
    { id: 1, text: "New task assigned to you", time: "2m ago", unread: true },
    { id: 2, text: "Project deadline approaching", time: "1h ago", unread: true },
    { id: 3, text: "Team meeting in 30 minutes", time: "2h ago", unread: false },
  ])

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <header className="h-16 bg-black/20 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden text-white hover:bg-white/10"
          onClick={onMobileMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search projects, tasks, or team members..."
            className="pl-10 w-80 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-purple-500/50"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>

        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
          <Settings className="w-5 h-5" />
        </Button>

        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>

        <div className="flex items-center space-x-2 cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">JD</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </header>
  )
}

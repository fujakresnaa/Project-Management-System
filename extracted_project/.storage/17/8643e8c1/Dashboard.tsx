"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, FolderOpen, CheckSquare, TrendingUp, Calendar, Clock, Target, Download } from "lucide-react"

interface DashboardProps {
  onExport: () => void
}

export default function Dashboard({ onExport }: DashboardProps) {
  const [timeRange, setTimeRange] = useState("7d")

  // Mock data for dashboard metrics
  const metrics = {
    totalProjects: 12,
    activeProjects: 8,
    completedTasks: 156,
    totalTasks: 203,
    teamMembers: 15,
    upcomingDeadlines: 7,
  }

  const recentProjects = [
    { id: 1, name: "Website Redesign", progress: 75, status: "In Progress", dueDate: "2025-08-25" },
    { id: 2, name: "Mobile App", progress: 45, status: "In Progress", dueDate: "2025-09-01" },
    { id: 3, name: "Marketing Campaign", progress: 90, status: "Review", dueDate: "2025-08-23" },
    { id: 4, name: "Database Migration", progress: 30, status: "Planning", dueDate: "2025-09-15" },
  ]

  const recentActivity = [
    { id: 1, user: "Sarah Chen", action: "completed task", target: "Homepage Design", time: "2 hours ago" },
    { id: 2, user: "Mike Johnson", action: "created project", target: "Q4 Planning", time: "4 hours ago" },
    { id: 3, user: "Emma Davis", action: "updated milestone", target: "Beta Release", time: "6 hours ago" },
    { id: 4, user: "Alex Rodriguez", action: "commented on", target: "API Documentation", time: "8 hours ago" },
  ]

  const upcomingTasks = [
    { id: 1, title: "Review wireframes", project: "Website Redesign", dueDate: "Today", priority: "High" },
    { id: 2, title: "Update documentation", project: "Mobile App", dueDate: "Tomorrow", priority: "Medium" },
    { id: 3, title: "Client presentation", project: "Marketing Campaign", dueDate: "Aug 23", priority: "High" },
    { id: 4, title: "Code review", project: "Database Migration", dueDate: "Aug 24", priority: "Low" },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Review":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "Planning":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "Completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here&apos;s what&apos;s happening with your projects.</p>
        </div>
        <Button onClick={onExport} className="glass border-white/20 hover:bg-white/10">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Projects</p>
                <p className="text-2xl font-bold text-white">{metrics.activeProjects}</p>
                <p className="text-xs text-gray-500">of {metrics.totalProjects} total</p>
              </div>
              <div className="p-3 rounded-full bg-purple-500/20">
                <FolderOpen className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tasks Completed</p>
                <p className="text-2xl font-bold text-white">{metrics.completedTasks}</p>
                <p className="text-xs text-gray-500">of {metrics.totalTasks} total</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/20">
                <CheckSquare className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Team Members</p>
                <p className="text-2xl font-bold text-white">{metrics.teamMembers}</p>
                <p className="text-xs text-green-400">+2 this month</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/20">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Upcoming Deadlines</p>
                <p className="text-2xl font-bold text-white">{metrics.upcomingDeadlines}</p>
                <p className="text-xs text-orange-400">Next 7 days</p>
              </div>
              <div className="p-3 rounded-full bg-orange-500/20">
                <Calendar className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5" />
              Recent Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium">{project.name}</h4>
                  <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Progress: {project.progress}%</span>
                  <span className="text-gray-400">Due: {project.dueDate}</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex-1">
                  <h4 className="text-white font-medium">{task.title}</h4>
                  <p className="text-sm text-gray-400">{task.project}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  <span className="text-xs text-gray-400">{task.dueDate}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                  {activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex-1">
                  <p className="text-white">
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-gray-400"> {activity.action} </span>
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, User, Flag, Search, Plus, Grid, List, MoreHorizontal } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "review" | "done"
  priority: "low" | "medium" | "high" | "urgent"
  assignee: string
  project: string
  dueDate: string
  tags: string[]
  createdAt: string
}

interface TasksViewProps {
  onExport: () => void
}

export default function TasksView({ onExport }: TasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Design Homepage Layout",
      description: "Create wireframes and mockups for the new homepage design",
      status: "in-progress",
      priority: "high",
      assignee: "Sarah Chen",
      project: "Website Redesign",
      dueDate: "2024-01-15",
      tags: ["design", "ui/ux"],
      createdAt: "2024-01-10",
    },
    {
      id: "2",
      title: "Implement User Authentication",
      description: "Set up login and registration functionality with JWT tokens",
      status: "todo",
      priority: "urgent",
      assignee: "Mike Johnson",
      project: "Mobile App",
      dueDate: "2024-01-12",
      tags: ["backend", "security"],
      createdAt: "2024-01-08",
    },
    {
      id: "3",
      title: "Write API Documentation",
      description: "Document all REST API endpoints with examples",
      status: "review",
      priority: "medium",
      assignee: "Alex Rodriguez",
      project: "API Development",
      dueDate: "2024-01-20",
      tags: ["documentation", "api"],
      createdAt: "2024-01-05",
    },
    {
      id: "4",
      title: "Setup CI/CD Pipeline",
      description: "Configure automated testing and deployment pipeline",
      status: "done",
      priority: "high",
      assignee: "Emily Davis",
      project: "DevOps",
      dueDate: "2024-01-08",
      tags: ["devops", "automation"],
      createdAt: "2024-01-01",
    },
  ])

  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterProject, setFilterProject] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "todo" as const,
    priority: "medium" as const,
    assignee: "",
    project: "",
    dueDate: "",
    tags: [] as string[],
  })

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || task.status === filterStatus
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority
    const matchesProject = filterProject === "all" || task.project === filterProject

    return matchesSearch && matchesStatus && matchesPriority && matchesProject
  })

  const tasksByStatus = {
    todo: filteredTasks.filter((task) => task.status === "todo"),
    "in-progress": filteredTasks.filter((task) => task.status === "in-progress"),
    review: filteredTasks.filter((task) => task.status === "review"),
    done: filteredTasks.filter((task) => task.status === "done"),
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      case "in-progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "review":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "done":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const handleCreateTask = () => {
    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      createdAt: new Date().toISOString().split("T")[0],
    }
    setTasks([...tasks, task])
    setNewTask({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      assignee: "",
      project: "",
      dueDate: "",
      tags: [],
    })
    setIsCreateDialogOpen(false)
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId)
  }

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("text/plain")
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus as Task["status"] } : task)))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-gray-400">Manage and track your project tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onExport}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/20 text-white">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task["priority"] })}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assignee">Assignee</Label>
                    <Input
                      id="assignee"
                      value={newTask.assignee}
                      onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="project">Project</Label>
                    <Input
                      id="project"
                      value={newTask.project}
                      onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
                <Button onClick={handleCreateTask} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "kanban" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("kanban")}
            className={viewMode === "kanban" ? "bg-purple-600" : "border-white/20 text-white hover:bg-white/10"}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-purple-600" : "border-white/20 text-white hover:bg-white/10"}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Task Views */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
            <div key={status} className="space-y-4" onDrop={(e) => handleDrop(e, status)} onDragOver={handleDragOver}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white capitalize">{status.replace("-", " ")}</h3>
                <Badge variant="secondary" className="bg-white/10 text-white">
                  {statusTasks.length}
                </Badge>
              </div>
              <div className="space-y-3 min-h-[200px]">
                {statusTasks.map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all cursor-move"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-white text-sm">{task.title}</h4>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">{task.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
                          {task.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs border-white/20 text-gray-300">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{task.assignee}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{task.dueDate}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-white">{task.title}</h4>
                      <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                        {task.status.replace("-", " ")}
                      </Badge>
                      <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
                    </div>
                    <p className="text-sm text-gray-400">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{task.assignee}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{task.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flag className="w-3 h-3" />
                        <span>{task.project}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

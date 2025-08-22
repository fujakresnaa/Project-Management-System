"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Grid, List, Calendar, Users, Edit, Trash2, Download } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string
  status: "active" | "completed" | "on-hold" | "planning"
  priority: "low" | "medium" | "high" | "urgent"
  progress: number
  dueDate: string
  team: string[]
  budget: number
  tags: string[]
}

interface ProjectsViewProps {
  onExport: () => void
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ onExport }) => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Website Redesign",
      description: "Complete overhaul of company website with modern design",
      status: "active",
      priority: "high",
      progress: 75,
      dueDate: "2024-03-15",
      team: ["Alice Johnson", "Bob Smith", "Carol Davis"],
      budget: 50000,
      tags: ["Design", "Development", "Marketing"],
    },
    {
      id: "2",
      name: "Mobile App Development",
      description: "Native iOS and Android app for customer engagement",
      status: "active",
      priority: "urgent",
      progress: 45,
      dueDate: "2024-04-20",
      team: ["David Wilson", "Eva Brown", "Frank Miller"],
      budget: 120000,
      tags: ["Mobile", "Development", "UX"],
    },
    {
      id: "3",
      name: "Data Migration",
      description: "Migrate legacy systems to new cloud infrastructure",
      status: "planning",
      priority: "medium",
      progress: 15,
      dueDate: "2024-05-30",
      team: ["Grace Lee", "Henry Taylor"],
      budget: 75000,
      tags: ["Infrastructure", "Data", "Cloud"],
    },
    {
      id: "4",
      name: "Marketing Campaign",
      description: "Q2 digital marketing campaign across all channels",
      status: "completed",
      priority: "medium",
      progress: 100,
      dueDate: "2024-02-28",
      team: ["Ivy Chen", "Jack Anderson"],
      budget: 30000,
      tags: ["Marketing", "Digital", "Campaign"],
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: "",
    description: "",
    status: "planning",
    priority: "medium",
    progress: 0,
    dueDate: "",
    team: [],
    budget: 0,
    tags: [],
  })

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "on-hold":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "planning":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
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

  const handleCreateProject = () => {
    if (newProject.name && newProject.description) {
      const project: Project = {
        id: Date.now().toString(),
        name: newProject.name,
        description: newProject.description,
        status: (newProject.status as Project["status"]) || "planning",
        priority: (newProject.priority as Project["priority"]) || "medium",
        progress: newProject.progress || 0,
        dueDate: newProject.dueDate || "",
        team: newProject.team || [],
        budget: newProject.budget || 0,
        tags: newProject.tags || [],
      }
      setProjects([...projects, project])
      setNewProject({
        name: "",
        description: "",
        status: "planning",
        priority: "medium",
        progress: 0,
        dueDate: "",
        team: [],
        budget: 0,
        tags: [],
      })
      setIsCreateDialogOpen(false)
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setNewProject(project)
    setIsCreateDialogOpen(true)
  }

  const handleUpdateProject = () => {
    if (editingProject && newProject.name && newProject.description) {
      const updatedProjects = projects.map((p) =>
        p.id === editingProject.id ? ({ ...editingProject, ...newProject } as Project) : p,
      )
      setProjects(updatedProjects)
      setEditingProject(null)
      setNewProject({
        name: "",
        description: "",
        status: "planning",
        priority: "medium",
        progress: 0,
        dueDate: "",
        team: [],
        budget: 0,
        tags: [],
      })
      setIsCreateDialogOpen(false)
    }
  }

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter((p) => p.id !== projectId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-400">Manage and track your projects</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onExport} variant="outline" size="sm" className="glass-card border-white/10 bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProject ? "Edit Project" : "Create New Project"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      value={newProject.name || ""}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      className="glass-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget ($)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={newProject.budget || ""}
                      onChange={(e) => setNewProject({ ...newProject, budget: Number.parseInt(e.target.value) || 0 })}
                      className="glass-input"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProject.description || ""}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="glass-input"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={newProject.status}
                      onValueChange={(value) => setNewProject({ ...newProject, status: value as Project["status"] })}
                    >
                      <SelectTrigger className="glass-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newProject.priority}
                      onValueChange={(value) =>
                        setNewProject({ ...newProject, priority: value as Project["priority"] })
                      }
                    >
                      <SelectTrigger className="glass-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newProject.dueDate || ""}
                      onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
                      className="glass-input"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="glass-card border-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={editingProject ? handleUpdateProject : handleCreateProject}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {editingProject ? "Update" : "Create"} Project
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-input"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] glass-input">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/10">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px] glass-input">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/10">
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={
              viewMode === "grid" ? "bg-gradient-to-r from-purple-600 to-pink-600" : "glass-card border-white/10"
            }
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={
              viewMode === "list" ? "bg-gradient-to-r from-purple-600 to-pink-600" : "glass-card border-white/10"
            }
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Projects Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="glass-card border-white/10 hover:border-white/20 transition-all duration-300 group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-white text-lg">{project.name}</CardTitle>
                    <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProject(project)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                  <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{project.team.length}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-white/20 text-gray-300">
                      {tag}
                    </Badge>
                  ))}
                  {project.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                      +{project.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-gray-400">
                  Budget: <span className="text-white font-medium">${project.budget.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="glass-card border-white/10 hover:border-white/20 transition-all duration-300 group"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{project.name}</h3>
                      <p className="text-gray-400 text-sm truncate">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                      <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                    </div>
                    <div className="w-32">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{project.team.length}</span>
                      </div>
                      <span>${project.budget.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProject(project)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No projects found matching your criteria</div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Project
          </Button>
        </div>
      )}
    </div>
  )
}

export default ProjectsView

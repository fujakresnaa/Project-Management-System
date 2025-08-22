"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Upload,
  Grid,
  List,
  File,
  FileText,
  ImageIcon,
  Video,
  Archive,
  Download,
  Share,
  MoreHorizontal,
  Folder,
} from "lucide-react"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  fileType?: "document" | "image" | "video" | "archive" | "other"
  size?: string
  modified: string
  project: string
  shared: boolean
  url?: string
}

interface FilesViewProps {
  onExport: () => void
}

export default function FilesView({ onExport }: FilesViewProps) {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "1",
      name: "Project Wireframes",
      type: "folder",
      modified: "2024-01-15",
      project: "Website Redesign",
      shared: true,
    },
    {
      id: "2",
      name: "homepage-mockup.png",
      type: "file",
      fileType: "image",
      size: "2.4 MB",
      modified: "2024-01-14",
      project: "Website Redesign",
      shared: false,
      url: "/homepage-mockup.png",
    },
    {
      id: "3",
      name: "API Documentation.pdf",
      type: "file",
      fileType: "document",
      size: "1.8 MB",
      modified: "2024-01-13",
      project: "API Development",
      shared: true,
    },
    {
      id: "4",
      name: "Demo Video.mp4",
      type: "file",
      fileType: "video",
      size: "45.2 MB",
      modified: "2024-01-12",
      project: "Mobile App",
      shared: false,
    },
    {
      id: "5",
      name: "Assets",
      type: "folder",
      modified: "2024-01-11",
      project: "Website Redesign",
      shared: true,
    },
    {
      id: "6",
      name: "source-code.zip",
      type: "file",
      fileType: "archive",
      size: "12.5 MB",
      modified: "2024-01-10",
      project: "Mobile App",
      shared: false,
    },
  ])

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterProject, setFilterProject] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = filterProject === "all" || file.project === filterProject
    const matchesType =
      filterType === "all" ||
      (filterType === "folders" && file.type === "folder") ||
      (filterType === "documents" && file.fileType === "document") ||
      (filterType === "images" && file.fileType === "image") ||
      (filterType === "videos" && file.fileType === "video") ||
      (filterType === "archives" && file.fileType === "archive")

    return matchesSearch && matchesProject && matchesType
  })

  const getFileIcon = (file: FileItem) => {
    if (file.type === "folder") {
      return <Folder className="w-8 h-8 text-blue-400" />
    }

    switch (file.fileType) {
      case "document":
        return <FileText className="w-8 h-8 text-red-400" />
      case "image":
        return <ImageIcon className="w-8 h-8 text-green-400" />
      case "video":
        return <Video className="w-8 h-8 text-purple-400" />
      case "archive":
        return <Archive className="w-8 h-8 text-orange-400" />
      default:
        return <File className="w-8 h-8 text-gray-400" />
    }
  }

  const handleUpload = () => {
    // Simulate file upload
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploadDialogOpen(false)
          return 0
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Files</h1>
          <p className="text-gray-400">Manage and organize your project files</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onExport}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            Export
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/20 text-white">
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">Drag and drop files here, or click to browse</p>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                    Browse Files
                  </Button>
                </div>
                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="bg-white/10" />
                  </div>
                )}
                <Button onClick={handleUpload} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                  Start Upload
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Storage Usage */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Storage Usage</h3>
            <span className="text-sm text-gray-400">2.4 GB of 10 GB used</span>
          </div>
          <Progress value={24} className="bg-white/10" />
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="Website Redesign">Website Redesign</SelectItem>
                <SelectItem value="Mobile App">Mobile App</SelectItem>
                <SelectItem value="API Development">API Development</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="folders">Folders</SelectItem>
                <SelectItem value="documents">Documents</SelectItem>
                <SelectItem value="images">Images</SelectItem>
                <SelectItem value="videos">Videos</SelectItem>
                <SelectItem value="archives">Archives</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-purple-600" : "border-white/20 text-white hover:bg-white/10"}
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

      {/* Files Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredFiles.map((file) => (
            <Card
              key={file.id}
              className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {getFileIcon(file)}
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm truncate">{file.name}</h4>
                    <p className="text-xs text-gray-400">{file.project}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{file.size || "—"}</span>
                    <span>{file.modified}</span>
                  </div>
                  {file.shared && (
                    <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                      Shared
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <Card
              key={file.id}
              className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getFileIcon(file)}
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{file.name}</h4>
                      <p className="text-sm text-gray-400">{file.project}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="w-20 text-right">{file.size || "—"}</span>
                    <span className="w-24 text-right">{file.modified}</span>
                    {file.shared && (
                      <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                        Shared
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                        <Share className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

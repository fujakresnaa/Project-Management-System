"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MessageCircle, Users, Activity, Settings, Mail, MapPin } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  department: string
  avatar: string
  status: "online" | "offline" | "away"
  skills: string[]
  projects: number
  tasksCompleted: number
  joinDate: string
}

interface TeamViewProps {
  onExport: () => void
}

export default function TeamView({ onExport }: TeamViewProps) {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Sarah Chen",
      email: "sarah.chen@company.com",
      role: "UI/UX Designer",
      department: "Design",
      avatar: "/professional-woman-avatar.png",
      status: "online",
      skills: ["Figma", "Adobe XD", "Prototyping"],
      projects: 5,
      tasksCompleted: 23,
      joinDate: "2023-03-15",
    },
    {
      id: "2",
      name: "Mike Johnson",
      email: "mike.johnson@company.com",
      role: "Full Stack Developer",
      department: "Engineering",
      avatar: "/professional-man-avatar.png",
      status: "online",
      skills: ["React", "Node.js", "TypeScript"],
      projects: 8,
      tasksCompleted: 45,
      joinDate: "2022-11-20",
    },
    {
      id: "3",
      name: "Alex Rodriguez",
      email: "alex.rodriguez@company.com",
      role: "Product Manager",
      department: "Product",
      avatar: "/professional-woman-marketing-avatar.png",
      status: "away",
      skills: ["Strategy", "Analytics", "Roadmapping"],
      projects: 12,
      tasksCompleted: 67,
      joinDate: "2022-08-10",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.davis@company.com",
      role: "DevOps Engineer",
      department: "Engineering",
      avatar: "/professional-man-avatar-developer.png",
      status: "offline",
      skills: ["AWS", "Docker", "Kubernetes"],
      projects: 6,
      tasksCompleted: 34,
      joinDate: "2023-01-05",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState<string>("all")
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
  })

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = filterDepartment === "all" || member.department === filterDepartment

    return matchesSearch && matchesDepartment
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleInviteMember = () => {
    const member: TeamMember = {
      id: Date.now().toString(),
      ...newMember,
      avatar: "/professional-woman-avatar-project-manager.png",
      status: "offline",
      skills: [],
      projects: 0,
      tasksCompleted: 0,
      joinDate: new Date().toISOString().split("T")[0],
    }
    setMembers([...members, member])
    setNewMember({ name: "", email: "", role: "", department: "" })
    setIsInviteDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <p className="text-gray-400">Manage your team members and collaboration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onExport}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            Export
          </Button>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/20 text-white">
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={newMember.department}
                    onValueChange={(value) => setNewMember({ ...newMember, department: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleInviteMember} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                  Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="bg-white/10 border-white/20">
          <TabsTrigger value="members" className="data-[state=active]:bg-purple-600">
            <Users className="w-4 h-4 mr-2" />
            Members
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-purple-600">
            <Activity className="w-4 h-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-purple-600">
            <MessageCircle className="w-4 h-4 mr-2" />
            Team Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <Card
                key={member.id}
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all"
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback className="bg-purple-600 text-white">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${getStatusColor(member.status)}`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{member.name}</h3>
                        <p className="text-sm text-gray-400">{member.role}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Mail className="w-3 h-3" />
                        <span>{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="w-3 h-3" />
                        <span>{member.department}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {member.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs border-white/20 text-gray-300">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{member.projects}</div>
                        <div className="text-xs text-gray-400">Projects</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">{member.tasksCompleted}</div>
                        <div className="text-xs text-gray-400">Tasks Done</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-white/20 text-white hover:bg-white/10 bg-transparent"
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Message
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                      >
                        <Settings className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-white mb-4">Recent Team Activity</h3>
              <div className="space-y-4">
                {[
                  { user: "Sarah Chen", action: "completed task", target: "Homepage Design", time: "2 hours ago" },
                  { user: "Mike Johnson", action: "joined project", target: "Mobile App", time: "4 hours ago" },
                  { user: "Alex Rodriguez", action: "updated milestone", target: "Q1 Planning", time: "6 hours ago" },
                  { user: "Emily Davis", action: "deployed", target: "Production Release", time: "1 day ago" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-purple-600 text-white text-xs">
                        {activity.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        <span className="font-medium">{activity.user}</span> {activity.action}{" "}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-white mb-4">Team Chat</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {[
                  {
                    user: "Sarah Chen",
                    message: "Great work on the new designs everyone!",
                    time: "10:30 AM",
                    avatar: "/professional-woman-avatar.png",
                  },
                  {
                    user: "Mike Johnson",
                    message: "Thanks! The API integration is almost ready too.",
                    time: "10:32 AM",
                    avatar: "/professional-man-avatar.png",
                  },
                  {
                    user: "Alex Rodriguez",
                    message: "Perfect timing. We can demo this to stakeholders tomorrow.",
                    time: "10:35 AM",
                    avatar: "/professional-woman-marketing-avatar.png",
                  },
                ].map((message, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.avatar || "/placeholder.svg"} alt={message.user} />
                      <AvatarFallback className="bg-purple-600 text-white text-xs">
                        {message.user
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm">{message.user}</span>
                        <span className="text-xs text-gray-400">{message.time}</span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                <Input
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">Send</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

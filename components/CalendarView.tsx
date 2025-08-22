"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, MapPin, Users } from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  type: "meeting" | "deadline" | "milestone" | "event"
  attendees?: string[]
  location?: string
  project: string
}

interface CalendarViewProps {
  onExport: () => void
}

export default function CalendarView({ onExport }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Team Standup",
      description: "Daily team sync meeting",
      date: "2024-01-15",
      time: "09:00",
      type: "meeting",
      attendees: ["Sarah Chen", "Mike Johnson", "Alex Rodriguez"],
      location: "Conference Room A",
      project: "Website Redesign",
    },
    {
      id: "2",
      title: "Project Deadline",
      description: "Final submission for homepage redesign",
      date: "2024-01-18",
      time: "17:00",
      type: "deadline",
      project: "Website Redesign",
    },
    {
      id: "3",
      title: "Client Presentation",
      description: "Present Q1 roadmap to stakeholders",
      date: "2024-01-20",
      time: "14:00",
      type: "meeting",
      attendees: ["Alex Rodriguez", "Emily Davis"],
      location: "Zoom Meeting",
      project: "Q1 Planning",
    },
    {
      id: "4",
      title: "Sprint Planning",
      description: "Plan next sprint objectives and tasks",
      date: "2024-01-22",
      time: "10:00",
      type: "meeting",
      attendees: ["Mike Johnson", "Sarah Chen", "Alex Rodriguez"],
      location: "Conference Room B",
      project: "Mobile App",
    },
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    type: "meeting" as const,
    location: "",
    project: "",
  })

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getEventsForDate = (day: number | null) => {
    if (!day) return []

    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter((event) => event.date === dateStr)
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "deadline":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "milestone":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "event":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleCreateEvent = () => {
    const event: CalendarEvent = {
      id: Date.now().toString(),
      ...newEvent,
      attendees: [],
    }
    setEvents([...events, event])
    setNewEvent({
      title: "",
      description: "",
      date: "",
      time: "",
      type: "meeting",
      location: "",
      project: "",
    })
    setIsCreateDialogOpen(false)
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-gray-400">Manage your schedule and events</p>
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
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-white/20 text-white">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newEvent.type}
                      onValueChange={(value) => setNewEvent({ ...newEvent, type: value as CalendarEvent["type"] })}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                        <SelectItem value="milestone">Milestone</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="project">Project</Label>
                    <Input
                      id="project"
                      value={newEvent.project}
                      onChange={(e) => setNewEvent({ ...newEvent, project: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <Button onClick={handleCreateEvent} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                  Create Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("prev")}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("next")}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentDate).map((day, index) => {
                  const dayEvents = getEventsForDate(day)
                  return (
                    <div
                      key={index}
                      className={`min-h-[80px] p-1 border border-white/10 rounded ${
                        day ? "bg-white/5 hover:bg-white/10" : ""
                      }`}
                    >
                      {day && (
                        <>
                          <div className="text-sm text-white mb-1">{day}</div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs p-1 rounded truncate ${getEventTypeColor(event.type)}`}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-gray-400">+{dayEvents.length - 2} more</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-white mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white text-sm">{event.title}</h4>
                      <Badge className={`text-xs ${getEventTypeColor(event.type)}`}>{event.type}</Badge>
                    </div>
                    <div className="space-y-1 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{event.time}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{event.attendees.length} attendees</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Event Types Legend */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-white mb-4">Event Types</h3>
              <div className="space-y-2">
                {[
                  { type: "meeting", label: "Meetings" },
                  { type: "deadline", label: "Deadlines" },
                  { type: "milestone", label: "Milestones" },
                  { type: "event", label: "Events" },
                ].map(({ type, label }) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${getEventTypeColor(type).split(" ")[0]}`} />
                    <span className="text-sm text-gray-300">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

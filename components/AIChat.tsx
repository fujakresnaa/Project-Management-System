"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X, 
  Minimize2, 
  Maximize2, 
  FileText,
  Users,
  Calendar,
  BarChart3,
  FolderOpen,
  CheckSquare,
  Paperclip,
  Download,
  Search
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'ai'
  timestamp: string
  type: 'text' | 'data' | 'suggestion' | 'action'
  relatedModule?: string
  relatedData?: any
  attachments?: string[]
}

interface AIChatProps {
  isOpen: boolean
  onClose: () => void
  currentView: string
  userData?: any
  projects?: any[]
  tasks?: any[]
  team?: any[]
  files?: any[]
  calendarEvents?: any[]
}

// Mock AI responses based on different modules and contexts
const getAIResponse = (message: string, currentView: string, userData?: any): ChatMessage => {
  const messageId = Date.now().toString()
  const timestamp = new Date().toISOString()
  
  const lowerMessage = message.toLowerCase()
  
  // Project-related queries
  if (lowerMessage.includes('project') || currentView === 'projects') {
    if (lowerMessage.includes('status') || lowerMessage.includes('progress')) {
      return {
        id: messageId,
        content: "Based on your current projects, here's the status overview:\n\n• **Website Redesign**: 75% complete, on track for deadline\n• **Mobile App Development**: 45% complete, slightly behind schedule\n• **Marketing Campaign**: 90% complete, ahead of schedule\n\nWould you like me to provide detailed analysis for any specific project?",
        sender: 'ai',
        timestamp,
        type: 'data',
        relatedModule: 'projects',
        relatedData: { projectCount: 3, avgProgress: 70 }
      }
    }
    if (lowerMessage.includes('create') || lowerMessage.includes('new')) {
      return {
        id: messageId,
        content: "I can help you create a new project! Here's what I recommend:\n\n1. **Project Name**: Choose a clear, descriptive name\n2. **Timeline**: Set realistic start and end dates\n3. **Team**: Assign team members based on skills\n4. **Budget**: Define budget constraints\n5. **Milestones**: Break down into key deliverables\n\nWould you like me to guide you through creating a specific project?",
        sender: 'ai',
        timestamp,
        type: 'suggestion',
        relatedModule: 'projects'
      }
    }
  }
  
  // Task-related queries
  if (lowerMessage.includes('task') || currentView === 'tasks') {
    if (lowerMessage.includes('overdue') || lowerMessage.includes('deadline')) {
      return {
        id: messageId,
        content: "Here are your urgent tasks requiring attention:\n\n🔴 **High Priority**:\n• Database optimization (Due: Today)\n• API security review (Due: Tomorrow)\n\n🟡 **Medium Priority**:\n• UI/UX improvements (Due: This week)\n• Documentation update (Due: Next week)\n\nShall I help you prioritize or reassign any of these tasks?",
        sender: 'ai',
        timestamp,
        type: 'data',
        relatedModule: 'tasks',
        relatedData: { overdueTasks: 2, upcomingTasks: 4 }
      }
    }
    if (lowerMessage.includes('productivity') || lowerMessage.includes('performance')) {
      return {
        id: messageId,
        content: "Your task completion analytics:\n\n📊 **This Week**: 12 tasks completed\n📈 **Productivity**: +15% vs last week\n⏱️ **Avg. Completion Time**: 2.3 days\n🎯 **Success Rate**: 87%\n\nTop performing areas:\n• Code reviews: 95% on-time\n• Documentation: 90% quality score\n\nAreas for improvement:\n• Testing tasks: Consider more time allocation",
        sender: 'ai',
        timestamp,
        type: 'data',
        relatedModule: 'analytics'
      }
    }
  }
  
  // Team-related queries
  if (lowerMessage.includes('team') || lowerMessage.includes('member') || currentView === 'team') {
    if (lowerMessage.includes('workload') || lowerMessage.includes('capacity')) {
      return {
        id: messageId,
        content: "Team workload analysis:\n\n👤 **Sarah Chen**: 85% capacity (Frontend tasks)\n👤 **Mike Johnson**: 92% capacity (Backend development)\n👤 **Emma Wilson**: 70% capacity (Available for new tasks)\n👤 **Lisa Park**: 88% capacity (QA and testing)\n\n💡 **Recommendations**:\n• Assign new UI tasks to Emma\n• Consider redistributing some backend tasks from Mike\n• Sarah could take on additional design reviews",
        sender: 'ai',
        timestamp,
        type: 'data',
        relatedModule: 'team',
        relatedData: { teamSize: 4, avgCapacity: 84 }
      }
    }
    if (lowerMessage.includes('skill') || lowerMessage.includes('expertise')) {
      return {
        id: messageId,
        content: "Team skills matrix:\n\n**Frontend Development**:\n• Sarah Chen: Expert (React, Vue, CSS)\n• Emma Wilson: Intermediate (HTML, CSS, JS)\n\n**Backend Development**:\n• Mike Johnson: Expert (Node.js, Python, PostgreSQL)\n• Lisa Park: Intermediate (API testing, databases)\n\n**Design & UX**:\n• Sarah Chen: Advanced (Figma, Adobe Creative)\n• Emma Wilson: Expert (UI/UX, Prototyping)\n\n**Project Management**:\n• You: Expert (Agile, Scrum, Planning)\n\nNeed help matching skills to upcoming tasks?",
        sender: 'ai',
        timestamp,
        type: 'data',
        relatedModule: 'team'
      }
    }
  }
  
  // Calendar and scheduling
  if (lowerMessage.includes('calendar') || lowerMessage.includes('meeting') || lowerMessage.includes('schedule') || currentView === 'calendar') {
    return {
      id: messageId,
      content: "📅 **Upcoming Events**:\n\n**Today**:\n• 2:00 PM - Sprint Planning (Conference Room A)\n• 4:30 PM - Client Review Call\n\n**Tomorrow**:\n• 9:00 AM - Team Standup\n• 11:00 AM - Design Review Session\n• 3:00 PM - Milestone Deadline: Website Redesign\n\n**This Week**:\n• Wednesday: QA Testing Phase begins\n• Friday: Weekly Team Retrospective\n\n🤖 **Smart Scheduling**: I notice you have back-to-back meetings on Thursday. Should I suggest some buffer time?",
      sender: 'ai',
      timestamp,
      type: 'data',
      relatedModule: 'calendar'
    }
  }
  
  // Files and documents
  if (lowerMessage.includes('file') || lowerMessage.includes('document') || currentView === 'files') {
    return {
      id: messageId,
      content: "📁 **File Management Insights**:\n\n**Recent Activity**:\n• wireframes-v2.fig updated 2 hours ago\n• project-requirements.pdf modified yesterday\n• 3 new design assets uploaded\n\n**Storage Usage**: 2.4GB / 10GB (24%)\n\n**File Organization Tips**:\n• Consider creating subfolders for each project phase\n• Archive completed project files\n• Set up automated backups for critical documents\n\n**Quick Actions**:\n• Search for specific files\n• Share files with team members\n• Download project archives",
      sender: 'ai',
      timestamp,
      type: 'suggestion',
      relatedModule: 'files'
    }
  }
  
  // Analytics and reporting
  if (lowerMessage.includes('analytics') || lowerMessage.includes('report') || lowerMessage.includes('metric') || currentView === 'analytics') {
    return {
      id: messageId,
      content: "📊 **Performance Analytics**:\n\n**Project Health Score**: 8.2/10\n• On-time delivery: 89%\n• Budget adherence: 94%\n• Team satisfaction: 8.5/10\n\n**Key Metrics (This Month)**:\n• Tasks completed: 156 (+12% vs last month)\n• Average task cycle time: 3.2 days\n• Code review efficiency: 95%\n• Bug resolution time: 1.8 days\n\n**Trends**:\n📈 Productivity increasing\n📈 Team collaboration improved\n⚠️ Testing phase needs optimization\n\nWould you like a detailed breakdown of any specific metric?",
      sender: 'ai',
      timestamp,
      type: 'data',
      relatedModule: 'analytics'
    }
  }
  
  // General help and guidance
  if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
    return {
      id: messageId,
      content: "🤖 **I'm your AI Project Assistant!** Here's how I can help:\n\n**📊 Data Analysis**:\n• Project progress and health metrics\n• Task completion and productivity insights\n• Team workload and capacity analysis\n• Budget and timeline tracking\n\n**💡 Smart Suggestions**:\n• Task prioritization recommendations\n• Resource allocation optimization\n• Deadline and milestone planning\n• Risk identification and mitigation\n\n**🔍 Quick Actions**:\n• Search across all modules\n• Generate reports and summaries\n• Schedule meetings and events\n• File and document management\n\n**Commands you can try**:\n• \"Show me overdue tasks\"\n• \"Analyze team workload\"\n• \"What's the project status?\"\n• \"Schedule a team meeting\"\n• \"Generate productivity report\"",
      sender: 'ai',
      timestamp,
      type: 'suggestion'
    }
  }
  
  // Default response
  return {
    id: messageId,
    content: `I understand you're asking about: "${message}"\n\nBased on your current context (${currentView}), I can help you with:\n\n• **Data Analysis**: Get insights from your ${currentView} data\n• **Smart Recommendations**: Optimized suggestions for better workflow\n• **Quick Actions**: Perform common tasks efficiently\n• **Cross-module Integration**: Connect information across projects, tasks, team, and files\n\nCould you be more specific about what you'd like to know or accomplish?`,
    sender: 'ai',
    timestamp,
    type: 'text'
  }
}

export default function AIChat({ isOpen, onClose, currentView, userData, projects, tasks, team, files, calendarEvents }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: `👋 Hi there! I'm your AI Project Assistant. I can help you analyze data, manage tasks, and optimize your workflow across all modules.\n\nCurrently viewing: **${currentView.charAt(0).toUpperCase() + currentView.slice(1)}**\n\nWhat would you like to know or accomplish today?`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      type: 'text'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [contextData, setContextData] = useState<any>({})

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Update context data when props change
  useEffect(() => {
    setContextData({
      currentView,
      projects: projects?.length || 0,
      tasks: tasks?.length || 0,
      team: team?.length || 0,
      files: files?.length || 0,
      events: calendarEvents?.length || 0
    })
  }, [currentView, projects, tasks, team, files, calendarEvents])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = getAIResponse(inputMessage, currentView, userData)
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000) // 1-3 seconds delay
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'projects': return <FolderOpen className="w-4 h-4" />
      case 'tasks': return <CheckSquare className="w-4 h-4" />
      case 'team': return <Users className="w-4 h-4" />
      case 'files': return <FileText className="w-4 h-4" />
      case 'calendar': return <Calendar className="w-4 h-4" />
      case 'analytics': return <BarChart3 className="w-4 h-4" />
      default: return <Bot className="w-4 h-4" />
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/10 text-white max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 pb-2 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-lg">AI Project Assistant</DialogTitle>
                <p className="text-white/60 text-sm">Powered by advanced analytics • Context: {currentView}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {!isMinimized && (
          <>
            {/* Context Bar */}
            <div className="px-4 py-2 bg-white/5 border-b border-white/10">
              <div className="flex items-center gap-4 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <span>📊 Context:</span>
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-xs">
                    {contextData.projects} Projects
                  </Badge>
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-xs">
                    {contextData.tasks} Tasks
                  </Badge>
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20 text-xs">
                    {contextData.team} Team Members
                  </Badge>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : ''}`}>
                      <div
                        className={`
                          rounded-2xl px-4 py-3 ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'glass border border-white/10'
                          }
                        `}
                      >
                        {message.relatedModule && (
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/20">
                            {getModuleIcon(message.relatedModule)}
                            <span className="text-xs font-medium text-white/80 uppercase">
                              {message.relatedModule}
                            </span>
                            {message.type === 'data' && (
                              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                                Data Analysis
                              </Badge>
                            )}
                            {message.type === 'suggestion' && (
                              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                                Suggestion
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/20">
                            <div className="flex flex-wrap gap-2">
                              {message.attachments.map((attachment, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="glass border-white/20 text-white text-xs"
                                >
                                  <Paperclip className="w-3 h-3 mr-1" />
                                  {attachment}
                                  <Download className="w-3 h-3 ml-1" />
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className={`text-xs text-white/50 mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {formatDistanceToNow(new Date(message.timestamp))} ago
                      </div>
                    </div>
                    
                    {message.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="glass border border-white/10 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about projects, tasks, team performance, or anything else..."
                    className="glass border-white/20 text-white placeholder:text-white/50 pr-12"
                    disabled={isTyping}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-white/50 hover:text-white hover:bg-white/10"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="gradient-primary text-white px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Quick Action Buttons */}
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="glass border-white/20 text-white/70 hover:text-white text-xs"
                  onClick={() => setInputMessage("What's my project status?")}
                >
                  📊 Project Status
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass border-white/20 text-white/70 hover:text-white text-xs"
                  onClick={() => setInputMessage("Show me overdue tasks")}
                >
                  ⏰ Overdue Tasks
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass border-white/20 text-white/70 hover:text-white text-xs"
                  onClick={() => setInputMessage("Analyze team workload")}
                >
                  👥 Team Analysis
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass border-white/20 text-white/70 hover:text-white text-xs"
                  onClick={() => setInputMessage("Generate productivity report")}
                >
                  📈 Productivity
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
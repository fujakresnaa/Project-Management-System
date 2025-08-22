import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

// Mock AI service - in production, this would connect to OpenAI, Claude, or similar
class AIService {
  static async generateResponse(
    message: string, 
    context: any, 
    userData?: any
  ): Promise<{
    content: string
    type: 'text' | 'data' | 'suggestion' | 'action'
    relatedModule?: string
    relatedData?: any
    actions?: string[]
  }> {
    const lowerMessage = message.toLowerCase()
    
    try {
      // Project Analytics
      if (lowerMessage.includes('project') && (lowerMessage.includes('status') || lowerMessage.includes('analytics'))) {
        const projectStats = await this.getProjectAnalytics()
        return {
          content: this.formatProjectAnalytics(projectStats),
          type: 'data',
          relatedModule: 'projects',
          relatedData: projectStats,
          actions: ['view_projects', 'create_project', 'export_report']
        }
      }
      
      // Task Management
      if (lowerMessage.includes('task') && (lowerMessage.includes('overdue') || lowerMessage.includes('urgent'))) {
        const taskStats = await this.getTaskAnalytics()
        return {
          content: this.formatTaskAnalytics(taskStats),
          type: 'data',
          relatedModule: 'tasks',
          relatedData: taskStats,
          actions: ['view_tasks', 'create_task', 'assign_task']
        }
      }
      
      // Team Performance
      if (lowerMessage.includes('team') && (lowerMessage.includes('performance') || lowerMessage.includes('workload'))) {
        const teamStats = await this.getTeamAnalytics()
        return {
          content: this.formatTeamAnalytics(teamStats),
          type: 'data',
          relatedModule: 'team',
          relatedData: teamStats,
          actions: ['view_team', 'assign_members', 'schedule_meeting']
        }
      }
      
      // Default intelligent response
      return {
        content: `I understand you're asking about: "${message}"\n\nI can help you with:\n• Project analytics and insights\n• Task management and prioritization\n• Team performance metrics\n• Data visualization and reports\n\nWhat specific information would you like to explore?`,
        type: 'suggestion',
        actions: ['show_help', 'get_overview']
      }
      
    } catch (error) {
      console.error('AI Service error:', error)
      return {
        content: "I'm having trouble processing your request right now. Please try again or contact support if the issue persists.",
        type: 'text'
      }
    }
  }
  
  private static async getProjectAnalytics() {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_projects,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
          AVG(progress) as avg_progress,
          COUNT(CASE WHEN due_date < NOW() AND status != 'completed' THEN 1 END) as overdue_projects
        FROM projects
        WHERE archived_at IS NULL
      `)
      return result.rows[0]
    } catch (error) {
      console.error('Database error:', error)
      return {
        total_projects: 0,
        active_projects: 0,
        completed_projects: 0,
        avg_progress: 0,
        overdue_projects: 0
      }
    }
  }
  
  private static async getTaskAnalytics() {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_tasks,
          COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_tasks,
          COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN due_date < NOW() AND status != 'done' THEN 1 END) as overdue_tasks,
          AVG(CASE WHEN completed_at IS NOT NULL AND estimated_hours IS NOT NULL 
              THEN actual_hours / estimated_hours ELSE NULL END) as efficiency_ratio
        FROM tasks
      `)
      return result.rows[0]
    } catch (error) {
      console.error('Database error:', error)
      return {
        total_tasks: 0,
        todo_tasks: 0,
        in_progress_tasks: 0,
        completed_tasks: 0,
        overdue_tasks: 0,
        efficiency_ratio: 1
      }
    }
  }
  
  private static async getTeamAnalytics() {
    try {
      const result = await db.query(`
        SELECT 
          COUNT(DISTINCT u.id) as total_members,
          COUNT(DISTINCT CASE WHEN u.status = 'online' THEN u.id END) as online_members,
          COUNT(DISTINCT t.assigned_to) as active_members,
          AVG(task_counts.task_count) as avg_tasks_per_member
        FROM users u
        LEFT JOIN tasks t ON u.id = t.assigned_to AND t.status IN ('todo', 'in-progress')
        LEFT JOIN (
          SELECT assigned_to, COUNT(*) as task_count 
          FROM tasks 
          WHERE status IN ('todo', 'in-progress')
          GROUP BY assigned_to
        ) task_counts ON u.id = task_counts.assigned_to
        WHERE u.is_active = true
      `)
      return result.rows[0]
    } catch (error) {
      console.error('Database error:', error)
      return {
        total_members: 0,
        online_members: 0,
        active_members: 0,
        avg_tasks_per_member: 0
      }
    }
  }
  
  private static formatProjectAnalytics(stats: any): string {
    return `📊 **Project Analytics Overview**

**Current Status:**
• Total Projects: ${stats.total_projects}
• Active Projects: ${stats.active_projects}
• Completed Projects: ${stats.completed_projects}
• Average Progress: ${Math.round(stats.avg_progress || 0)}%
${stats.overdue_projects > 0 ? `• ⚠️ Overdue Projects: ${stats.overdue_projects}` : '• ✅ All projects on track!'}

**Key Insights:**
${stats.avg_progress > 70 ? '• Projects are progressing well overall' : '• Consider reviewing project timelines'}
${stats.overdue_projects > 0 ? '• Some projects need immediate attention' : '• Good project timeline management'}

**Recommendations:**
• Focus on completing in-progress projects
• Review resource allocation for overdue items
• Consider celebrating recent completions with the team`
  }
  
  private static formatTaskAnalytics(stats: any): string {
    const efficiency = stats.efficiency_ratio || 1
    return `📋 **Task Management Analytics**

**Current Workload:**
• Total Tasks: ${stats.total_tasks}
• To Do: ${stats.todo_tasks}
• In Progress: ${stats.in_progress_tasks}
• Completed: ${stats.completed_tasks}
${stats.overdue_tasks > 0 ? `• ⚠️ Overdue: ${stats.overdue_tasks}` : '• ✅ No overdue tasks!'}

**Performance Metrics:**
• Task Completion Rate: ${Math.round((stats.completed_tasks / stats.total_tasks) * 100)}%
• Efficiency Ratio: ${(efficiency * 100).toFixed(1)}%
• Active Tasks: ${stats.todo_tasks + stats.in_progress_tasks}

**Action Items:**
${stats.overdue_tasks > 0 ? '• Address overdue tasks immediately' : '• Maintain current pace'}
• Consider breaking down large tasks
• Review task estimation accuracy`
  }
  
  private static formatTeamAnalytics(stats: any): string {
    return `👥 **Team Performance Analytics**

**Team Overview:**
• Total Team Members: ${stats.total_members}
• Currently Online: ${stats.online_members}
• Active Contributors: ${stats.active_members}
• Avg Tasks per Member: ${Math.round(stats.avg_tasks_per_member || 0)}

**Team Health:**
${stats.active_members / stats.total_members > 0.8 ? '• 💪 High team engagement' : '• 📈 Room for improved engagement'}
${stats.avg_tasks_per_member < 5 ? '• Balanced workload distribution' : '• ⚖️ Consider workload rebalancing'}

**Recommendations:**
• Regular check-ins with team members
• Recognize top contributors
• Ensure equitable task distribution
• Schedule team building activities`
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, context, userData } = await request.json()
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }
    
    const response = await AIService.generateResponse(message, context, userData)
    
    return NextResponse.json({
      success: true,
      data: {
        id: Date.now().toString(),
        content: response.content,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        type: response.type,
        relatedModule: response.relatedModule,
        relatedData: response.relatedData,
        actions: response.actions
      }
    })
    
  } catch (error) {
    console.error('AI Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Chat API is running',
    endpoints: {
      POST: '/api/ai-chat - Send a message to the AI assistant'
    }
  })
}
import { ProjectService } from './ProjectService'
import { TaskService } from './TaskService'
import { UserRepository } from '../repositories/UserRepository'
import { ActivityLogger } from './ActivityLogger'
import { NotificationService } from './NotificationService'

export class DashboardService {
  private projectService: ProjectService
  private taskService: TaskService
  private userRepo: UserRepository
  private activityLogger: ActivityLogger
  private notificationService: NotificationService

  constructor() {
    this.projectService = new ProjectService()
    this.taskService = new TaskService()
    this.userRepo = new UserRepository()
    this.activityLogger = new ActivityLogger()
    this.notificationService = new NotificationService()
  }

  async getDashboardData(userId: string): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      // Get project metrics
      const projectData = await this.projectService.getDashboardData()
      if (!projectData.success) {
        return { success: false, errors: projectData.errors }
      }

      // Get user's task data
      const taskData = await this.taskService.getUserDashboardTasks(userId)
      if (!taskData.success) {
        return { success: false, errors: taskData.errors }
      }

      // Get team stats
      const teamStats = await this.userRepo.getTeamStats()

      // Get recent activity
      const recentActivity = await this.activityLogger.getRecentActivity(10)

      // Get user notifications
      const notifications = await this.notificationService.getNotifications(userId, 5)
      const unreadCount = await this.notificationService.getUnreadCount(userId)

      // Get upcoming deadlines
      const upcomingDeadlines = await this.taskService.getUpcomingDeadlines(userId, 7)

      return {
        success: true,
        data: {
          // Project metrics
          project_metrics: projectData.data.metrics,
          recent_projects: projectData.data.recent_projects,
          
          // Task data
          task_stats: taskData.data.stats,
          assigned_tasks: taskData.data.assigned_tasks,
          upcoming_deadlines: upcomingDeadlines.data || [],
          
          // Team and activity
          team_stats: teamStats,
          recent_activity: recentActivity,
          
          // User notifications
          notifications,
          unread_notifications: unreadCount,
          
          // Summary stats
          summary: {
            active_projects: projectData.data.metrics.active_projects || 0,
            pending_tasks: taskData.data.stats.todo_tasks + taskData.data.stats.in_progress_tasks || 0,
            completed_tasks: taskData.data.stats.done_tasks || 0,
            team_members: teamStats.total_members || 0,
            overdue_tasks: taskData.data.stats.overdue_tasks || 0
          }
        }
      }
    } catch (error) {
      console.error('Error getting dashboard data:', error)
      return { success: false, errors: ['Failed to get dashboard data'] }
    }
  }

  async getAnalyticsData(userId: string, timeframe: 'week' | 'month' | 'quarter' = 'month'): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      let days: number
      switch (timeframe) {
        case 'week':
          days = 7
          break
        case 'quarter':
          days = 90
          break
        default:
          days = 30
      }

      // Get productivity metrics
      const userActivity = await this.activityLogger.getUserActivity(userId, days)
      
      // Get task completion trends
      const taskStats = await this.taskService.getTasks({
        assigned_to: userId,
        date_from: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        limit: 1000
      })

      // Get project participation
      const projectData = await this.projectService.getProjects({
        created_by: userId,
        limit: 100
      })

      return {
        success: true,
        data: {
          activity_timeline: userActivity,
          task_completion_rate: this.calculateCompletionRate(taskStats.data?.tasks || []),
          project_contributions: projectData.data?.projects || [],
          productivity_score: this.calculateProductivityScore(userActivity, taskStats.data?.tasks || [])
        }
      }
    } catch (error) {
      console.error('Error getting analytics data:', error)
      return { success: false, errors: ['Failed to get analytics data'] }
    }
  }

  private calculateCompletionRate(tasks: any[]): number {
    if (tasks.length === 0) return 0
    const completedTasks = tasks.filter(task => task.status === 'done').length
    return Math.round((completedTasks / tasks.length) * 100)
  }

  private calculateProductivityScore(activities: any[], tasks: any[]): number {
    // Simple productivity score based on activity frequency and task completion
    const activityScore = Math.min(activities.length * 2, 50) // Max 50 points for activity
    const completionScore = this.calculateCompletionRate(tasks) / 2 // Max 50 points for completion rate
    return Math.round(activityScore + completionScore)
  }

  async exportData(userId: string, dataType: 'projects' | 'tasks' | 'all' = 'all'): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      const exportData: any = {
        exported_at: new Date().toISOString(),
        user_id: userId
      }

      if (dataType === 'projects' || dataType === 'all') {
        const projectData = await this.projectService.getProjects({ created_by: userId, limit: 1000 })
        exportData.projects = projectData.data?.projects || []
      }

      if (dataType === 'tasks' || dataType === 'all') {
        const taskData = await this.taskService.getTasks({ assigned_to: userId, limit: 1000 })
        exportData.tasks = taskData.data?.tasks || []
      }

      if (dataType === 'all') {
        const activity = await this.activityLogger.getUserActivity(userId, 365)
        exportData.activity = activity
      }

      return { success: true, data: exportData }
    } catch (error) {
      console.error('Error exporting data:', error)
      return { success: false, errors: ['Failed to export data'] }
    }
  }
}
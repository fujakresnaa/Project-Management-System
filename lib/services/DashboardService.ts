import { ProjectRepository } from '../repositories/ProjectRepository'
import { TaskRepository } from '../repositories/TaskRepository'
import { UserRepository } from '../repositories/UserRepository'
import { ActivityLogger } from './ActivityLogger'
import { DashboardMetrics } from '../models'

export class DashboardService {
  private projectRepo: ProjectRepository
  private taskRepo: TaskRepository
  private userRepo: UserRepository
  private activityLogger: ActivityLogger

  constructor() {
    this.projectRepo = new ProjectRepository()
    this.taskRepo = new TaskRepository()
    this.userRepo = new UserRepository()
    this.activityLogger = new ActivityLogger()
  }

  // Get comprehensive dashboard data
  async getDashboardData(userId: string): Promise<{ success: boolean; data?: DashboardMetrics; errors?: string[] }> {
    try {
      // Get project metrics
      const projectMetrics = await this.projectRepo.getDashboardMetrics()
      
      // Get task metrics
      const taskMetrics = await this.taskRepo.getDashboardMetrics()
      
      // Get team metrics
      const teamMetrics = await this.userRepo.getDashboardMetrics()
      
      // Get recent projects
      const recentProjects = await this.projectRepo.findAll({ 
        limit: 5, 
        sort_by: 'updated_at',
        sort_order: 'desc'
      })
      
      // Get recent activity
      const recentActivity = await this.activityLogger.getRecentActivity(10)
      
      // Get upcoming tasks for user
      const upcomingTasks = await this.taskRepo.findUpcomingTasks(7, userId)
      
      // Get user's project participation
      const userProjects = await this.projectRepo.getProjectsForUser(userId)

      // Compile dashboard data
      const dashboardData: DashboardMetrics = {
        total_projects: projectMetrics.total_projects,
        active_projects: projectMetrics.active_projects,
        completed_tasks: taskMetrics.completed_tasks,
        total_tasks: taskMetrics.total_tasks,
        team_members: teamMetrics.total_users,
        upcoming_deadlines: taskMetrics.upcoming_deadlines,
        recent_projects: recentProjects.data,
        recent_activity: recentActivity,
        upcoming_tasks: upcomingTasks
      }

      return { success: true, data: dashboardData }
    } catch (error) {
      console.error('Error getting dashboard data:', error)
      return { success: false, errors: ['Failed to get dashboard data'] }
    }
  }

  // Get analytics data for charts and graphs
  async getAnalyticsData(userId: string): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      // Project progress over time
      const projectProgress = await this.projectRepo.getProjectProgressTrend()
      
      // Task completion trends
      const taskCompletionTrend = await this.taskRepo.getCompletionTrend()
      
      // Team performance metrics
      const teamPerformance = await this.userRepo.getTeamPerformanceMetrics()
      
      // Workload distribution
      const workloadDistribution = await this.taskRepo.getWorkloadDistribution()

      return {
        success: true,
        data: {
          project_progress: projectProgress,
          task_completion_trend: taskCompletionTrend,
          team_performance: teamPerformance,
          workload_distribution: workloadDistribution
        }
      }
    } catch (error) {
      console.error('Error getting analytics data:', error)
      return { success: false, errors: ['Failed to get analytics data'] }
    }
  }

  // Get summary statistics
  async getSummaryStats(): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      const stats = await Promise.all([
        this.projectRepo.getDashboardMetrics(),
        this.taskRepo.getDashboardMetrics(),
        this.userRepo.getDashboardMetrics()
      ])

      const [projectStats, taskStats, userStats] = stats

      return {
        success: true,
        data: {
          projects: {
            total: projectStats.total_projects,
            active: projectStats.active_projects,
            completed: projectStats.completed_projects,
            on_hold: projectStats.on_hold_projects,
            avg_progress: Math.round(projectStats.avg_progress || 0),
            overdue: projectStats.overdue_projects
          },
          tasks: {
            total: taskStats.total_tasks,
            completed: taskStats.completed_tasks,
            in_progress: taskStats.in_progress_tasks,
            todo: taskStats.todo_tasks,
            overdue: taskStats.overdue_tasks,
            completion_rate: taskStats.total_tasks > 0 
              ? Math.round((taskStats.completed_tasks / taskStats.total_tasks) * 100) 
              : 0
          },
          team: {
            total_members: userStats.total_users,
            active_members: userStats.active_users,
            departments: userStats.departments || []
          }
        }
      }
    } catch (error) {
      console.error('Error getting summary stats:', error)
      return { success: false, errors: ['Failed to get summary statistics'] }
    }
  }
}
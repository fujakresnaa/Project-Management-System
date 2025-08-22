import { ProjectRepository } from '../repositories/ProjectRepository'
import { TaskRepository } from '../repositories/TaskRepository'
import { ActivityLogger } from './ActivityLogger'
import { NotificationService } from './NotificationService'
import { createProjectSchema, updateProjectSchema, validateData } from '../validation/schemas'
import { Project, QueryFilters } from '../models'

export class ProjectService {
  private projectRepo: ProjectRepository
  private taskRepo: TaskRepository
  private activityLogger: ActivityLogger
  private notificationService: NotificationService

  constructor() {
    this.projectRepo = new ProjectRepository()
    this.taskRepo = new TaskRepository()
    this.activityLogger = new ActivityLogger()
    this.notificationService = new NotificationService()
  }

  // Create new project with validation
  async createProject(data: any, userId: string): Promise<{ success: boolean; data?: Project; errors?: string[] }> {
    try {
      const validation = validateData(createProjectSchema, { ...data, created_by: userId })
      if (!validation.success) {
        return { success: false, errors: validation.errors }
      }

      const project = await this.projectRepo.create(validation.data)
      
      // Add creator as project owner
      await this.projectRepo.addMember(project.id, userId, 'owner')

      // Log activity
      await this.activityLogger.log({
        user_id: userId,
        action: 'created_project',
        entity_type: 'project',
        entity_id: project.id,
        entity_name: project.name,
        description: `Created project "${project.name}"`
      })

      // Send notifications to team leads about new project
      await this.notificationService.notifyNewProject(project, userId)

      return { success: true, data: project }
    } catch (error) {
      console.error('Error creating project:', error)
      return { success: false, errors: ['Failed to create project'] }
    }
  }

  // Update project with validation and progress calculation
  async updateProject(id: string, data: any, userId: string): Promise<{ success: boolean; data?: Project; errors?: string[] }> {
    try {
      const validation = validateData(updateProjectSchema, data)
      if (!validation.success) {
        return { success: false, errors: validation.errors }
      }

      const existingProject = await this.projectRepo.findById(id)
      if (!existingProject) {
        return { success: false, errors: ['Project not found'] }
      }

      // Auto-calculate progress if not provided
      if (!validation.data.progress) {
        const taskStats = await this.taskRepo.getTaskStats(id)
        if (taskStats.total_tasks > 0) {
          validation.data.progress = Math.round((taskStats.done_tasks / taskStats.total_tasks) * 100)
        }
      }

      const project = await this.projectRepo.update(id, validation.data)
      if (!project) {
        return { success: false, errors: ['Failed to update project'] }
      }

      // Log activity
      await this.activityLogger.log({
        user_id: userId,
        action: 'updated_project',
        entity_type: 'project',
        entity_id: project.id,
        entity_name: project.name,
        description: `Updated project "${project.name}"`
      })

      // Notify team members of important changes
      if (data.status || data.due_date) {
        await this.notificationService.notifyProjectUpdate(project, userId, data)
      }

      return { success: true, data: project }
    } catch (error) {
      console.error('Error updating project:', error)
      return { success: false, errors: ['Failed to update project'] }
    }
  }

  // Get project with full details and validation
  async getProject(id: string): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      const project = await this.projectRepo.findByIdWithMembers(id)
      if (!project) {
        return { success: false, errors: ['Project not found'] }
      }

      const members = await this.projectRepo.getMembers(id)
      const taskStats = await this.taskRepo.getTaskStats(id)
      const recentTasks = await this.taskRepo.getTasksByProject(id)

      return {
        success: true,
        data: {
          ...project,
          members,
          task_stats: taskStats,
          recent_tasks: recentTasks.slice(0, 5)
        }
      }
    } catch (error) {
      console.error('Error getting project:', error)
      return { success: false, errors: ['Failed to get project'] }
    }
  }

  // Get all projects with filters and stats
  async getProjects(filters: QueryFilters): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      const result = await this.projectRepo.findAllWithStats(filters)
      const metrics = await this.projectRepo.getDashboardMetrics()
      
      return {
        success: true,
        data: {
          projects: result.data,
          total: result.total,
          metrics
        }
      }
    } catch (error) {
      console.error('Error getting projects:', error)
      return { success: false, errors: ['Failed to get projects'] }
    }
  }

  // Add team member to project
  async addTeamMember(projectId: string, userId: string, role: string, requesterId: string): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const project = await this.projectRepo.findById(projectId)
      if (!project) {
        return { success: false, errors: ['Project not found'] }
      }

      await this.projectRepo.addMember(projectId, userId, role)

      // Log activity
      await this.activityLogger.log({
        user_id: requesterId,
        action: 'added_team_member',
        entity_type: 'project',
        entity_id: projectId,
        entity_name: project.name,
        description: `Added team member to project "${project.name}"`
      })

      // Notify new team member
      await this.notificationService.notifyTeamMemberAdded(project, userId, requesterId)

      return { success: true }
    } catch (error) {
      console.error('Error adding team member:', error)
      return { success: false, errors: ['Failed to add team member'] }
    }
  }

  // Remove team member from project
  async removeTeamMember(projectId: string, userId: string, requesterId: string): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const project = await this.projectRepo.findById(projectId)
      if (!project) {
        return { success: false, errors: ['Project not found'] }
      }

      const success = await this.projectRepo.removeMember(projectId, userId)
      if (!success) {
        return { success: false, errors: ['Failed to remove team member'] }
      }

      // Log activity
      await this.activityLogger.log({
        user_id: requesterId,
        action: 'removed_team_member',
        entity_type: 'project',
        entity_id: projectId,
        entity_name: project.name,
        description: `Removed team member from project "${project.name}"`
      })

      return { success: true }
    } catch (error) {
      console.error('Error removing team member:', error)
      return { success: false, errors: ['Failed to remove team member'] }
    }
  }

  // Delete project with cascade validation
  async deleteProject(id: string, userId: string): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const project = await this.projectRepo.findById(id)
      if (!project) {
        return { success: false, errors: ['Project not found'] }
      }

      // Check if project has active tasks
      const taskStats = await this.taskRepo.getTaskStats(id)
      if (taskStats.total_tasks > 0 && taskStats.done_tasks < taskStats.total_tasks) {
        return { success: false, errors: ['Cannot delete project with active tasks. Complete or reassign tasks first.'] }
      }

      const success = await this.projectRepo.delete(id)
      if (!success) {
        return { success: false, errors: ['Failed to delete project'] }
      }

      // Log activity
      await this.activityLogger.log({
        user_id: userId,
        action: 'deleted_project',
        entity_type: 'project',
        entity_id: id,
        entity_name: project.name,
        description: `Deleted project "${project.name}"`
      })

      return { success: true }
    } catch (error) {
      console.error('Error deleting project:', error)
      return { success: false, errors: ['Failed to delete project'] }
    }
  }

  // Get dashboard data for projects
  async getDashboardData(): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      const metrics = await this.projectRepo.getDashboardMetrics()
      const recentProjects = await this.projectRepo.findAll({ limit: 5, sort_by: 'updated_at' })
      
      return {
        success: true,
        data: {
          metrics,
          recent_projects: recentProjects.data
        }
      }
    } catch (error) {
      console.error('Error getting project dashboard data:', error)
      return { success: false, errors: ['Failed to get dashboard data'] }
    }
  }
}
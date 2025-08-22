import { TaskRepository } from '../repositories/TaskRepository'
import { ProjectRepository } from '../repositories/ProjectRepository'
import { ActivityLogger } from './ActivityLogger'
import { NotificationService } from './NotificationService'
import { createTaskSchema, updateTaskSchema, validateData } from '../validation/schemas'
import { Task, QueryFilters } from '../models'

export class TaskService {
  private taskRepo: TaskRepository
  private projectRepo: ProjectRepository
  private activityLogger: ActivityLogger
  private notificationService: NotificationService

  constructor() {
    this.taskRepo = new TaskRepository()
    this.projectRepo = new ProjectRepository()
    this.activityLogger = new ActivityLogger()
    this.notificationService = new NotificationService()
  }

  // Create new task with validation
  async createTask(data: any, userId: string): Promise<{ success: boolean; data?: Task; errors?: string[] }> {
    try {
      const validation = validateData(createTaskSchema, { ...data, created_by: userId })
      if (!validation.success) {
        return { success: false, errors: validation.errors }
      }

      // Verify project exists
      const project = await this.projectRepo.findById(validation.data.project_id)
      if (!project) {
        return { success: false, errors: ['Project not found'] }
      }

      const task = await this.taskRepo.create(validation.data)
      
      // Add tags if provided
      if (validation.data.tags && validation.data.tags.length > 0) {
        await this.taskRepo.addTags(task.id, validation.data.tags)
      }

      // Log activity
      await this.activityLogger.log({
        user_id: userId,
        action: 'created_task',
        entity_type: 'task',
        entity_id: task.id,
        entity_name: task.title,
        description: `Created task "${task.title}" in project "${project.name}"`
      })

      // Send notifications
      if (validation.data.assigned_to && validation.data.assigned_to !== userId) {
        await this.notificationService.notifyTaskAssigned(task, validation.data.assigned_to, userId)
      }

      return { success: true, data: task }
    } catch (error) {
      console.error('Error creating task:', error)
      return { success: false, errors: ['Failed to create task'] }
    }
  }

  // Update task with validation
  async updateTask(id: string, data: any, userId: string): Promise<{ success: boolean; data?: Task; errors?: string[] }> {
    try {
      const validation = validateData(updateTaskSchema, data)
      if (!validation.success) {
        return { success: false, errors: validation.errors }
      }

      const existingTask = await this.taskRepo.findById(id)
      if (!existingTask) {
        return { success: false, errors: ['Task not found'] }
      }

      // Auto-set completion timestamp if status changes to done
      if (validation.data.status === 'done' && existingTask.status !== 'done') {
        validation.data.completed_at = new Date().toISOString()
      }

      const task = await this.taskRepo.update(id, validation.data)
      if (!task) {
        return { success: false, errors: ['Failed to update task'] }
      }

      // Update tags if provided
      if (validation.data.tags) {
        await this.taskRepo.updateTags(id, validation.data.tags)
      }

      // Log activity
      await this.activityLogger.log({
        user_id: userId,
        action: 'updated_task',
        entity_type: 'task',
        entity_id: task.id,
        entity_name: task.title,
        description: `Updated task "${task.title}"`
      })

      // Send notifications for important changes
      if (validation.data.status || validation.data.assigned_to) {
        await this.notificationService.notifyTaskUpdate(task, userId, validation.data)
      }

      return { success: true, data: task }
    } catch (error) {
      console.error('Error updating task:', error)
      return { success: false, errors: ['Failed to update task'] }
    }
  }

  // Get task with full details
  async getTask(id: string): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      const task = await this.taskRepo.findByIdWithDetails(id)
      if (!task) {
        return { success: false, errors: ['Task not found'] }
      }

      const tags = await this.taskRepo.getTags(id)
      const comments = await this.taskRepo.getComments(id)
      
      return {
        success: true,
        data: {
          ...task,
          tags,
          comments
        }
      }
    } catch (error) {
      console.error('Error getting task:', error)
      return { success: false, errors: ['Failed to get task'] }
    }
  }

  // Get all tasks with filters
  async getTasks(filters: QueryFilters): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      const result = await this.taskRepo.findAllWithDetails(filters)
      const metrics = await this.taskRepo.getDashboardMetrics()
      
      return {
        success: true,
        data: {
          tasks: result.data,
          total: result.total,
          metrics
        }
      }
    } catch (error) {
      console.error('Error getting tasks:', error)
      return { success: false, errors: ['Failed to get tasks'] }
    }
  }

  // Delete task
  async deleteTask(id: string, userId: string): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const task = await this.taskRepo.findById(id)
      if (!task) {
        return { success: false, errors: ['Task not found'] }
      }

      const success = await this.taskRepo.delete(id)
      if (!success) {
        return { success: false, errors: ['Failed to delete task'] }
      }

      // Log activity
      await this.activityLogger.log({
        user_id: userId,
        action: 'deleted_task',
        entity_type: 'task',
        entity_id: id,
        entity_name: task.title,
        description: `Deleted task "${task.title}"`
      })

      return { success: true }
    } catch (error) {
      console.error('Error deleting task:', error)
      return { success: false, errors: ['Failed to delete task'] }
    }
  }

  // Get dashboard data for tasks
  async getDashboardData(): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      const metrics = await this.taskRepo.getDashboardMetrics()
      const recentTasks = await this.taskRepo.findAll({ limit: 10, sort_by: 'updated_at' })
      const upcomingTasks = await this.taskRepo.findUpcomingTasks(7)
      
      return {
        success: true,
        data: {
          metrics,
          recent_tasks: recentTasks.data,
          upcoming_tasks: upcomingTasks
        }
      }
    } catch (error) {
      console.error('Error getting task dashboard data:', error)
      return { success: false, errors: ['Failed to get dashboard data'] }
    }
  }
}
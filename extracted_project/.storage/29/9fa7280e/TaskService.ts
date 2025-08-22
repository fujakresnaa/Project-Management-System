import { TaskRepository } from '../repositories/TaskRepository'
import { ProjectRepository } from '../repositories/ProjectRepository'
import { UserRepository } from '../repositories/UserRepository'
import { ActivityLogger } from './ActivityLogger'
import { NotificationService } from './NotificationService'
import { createTaskSchema, updateTaskSchema, validateData } from '../validation/schemas'
import { Task, QueryFilters } from '../models'

export class TaskService {
  private taskRepo: TaskRepository
  private projectRepo: ProjectRepository
  private userRepo: UserRepository
  private activityLogger: ActivityLogger
  private notificationService: NotificationService

  constructor() {
    this.taskRepo = new TaskRepository()
    this.projectRepo = new ProjectRepository()
    this.userRepo = new UserRepository()
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

      // Verify assignee exists if provided
      if (validation.data.assigned_to) {
        const assignee = await this.userRepo.findById(validation.data.assigned_to)
        if (!assignee) {
          return { success: false, errors: ['Assigned user not found'] }
        }
      }

      const { tags, ...taskData } = validation.data
      const task = await this.taskRepo.create(taskData)

      // Add tags if provided
      if (tags && tags.length > 0) {
        await this.taskRepo.addTags(task.id, tags)
      }

      // Update project progress
      await this.updateProjectProgress(validation.data.project_id)

      // Log activity
      await this.activityLogger.log({
        user_id: userId,
        action: 'created_task',
        entity_type: 'task',
        entity_id: task.id,
        entity_name: task.title,
        description: `Created task "${task.title}" in project "${project.name}"`
      })

      // Notify assignee if different from creator
      if (validation.data.assigned_to && validation.data.assigned_to !== userId) {
        await this.notificationService.notifyTaskAssigned(task, project, validation.data.assigned_to, userId)
      }

      return { success: true, data: task }
    } catch (error) {
      console.error('Error creating task:', error)
      return { success: false, errors: ['Failed to create task'] }
    }
  }

  // Update task with validation and status change handling
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

      // Check if assignee changed
      const assigneeChanged = validation.data.assigned_to && validation.data.assigned_to !== existingTask.assigned_to

      // Handle tags separately
      const { tags, ...taskData } = validation.data
      const task = await this.taskRepo.update(id, taskData)
      if (!task) {
        return { success: false, errors: ['Failed to update task'] }
      }

      // Update tags if provided
      if (tags !== undefined) {
        // Get current tags
        const currentTask = await this.taskRepo.findByIdWithDetails(id)
        const currentTags = currentTask?.tags || []
        
        // Remove old tags and add new ones
        if (currentTags.length > 0) {
          await this.taskRepo.removeTags(id, currentTags)
        }
        if (tags.length > 0) {
          await this.taskRepo.addTags(id, tags)
        }
      }

      // Update project progress if status changed
      if (validation.data.status && validation.data.status !== existingTask.status) {
        await this.updateProjectProgress(task.project_id)
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

      // Handle notifications for various changes
      if (assigneeChanged) {
        await this.notificationService.notifyTaskReassigned(task, validation.data.assigned_to, userId)
      }

      if (validation.data.status === 'done') {
        await this.notificationService.notifyTaskCompleted(task, userId)
      }

      if (validation.data.due_date && validation.data.due_date !== existingTask.due_date) {
        await this.notificationService.notifyTaskDeadlineChanged(task, userId)
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

      return { success: true, data: task }
    } catch (error) {
      console.error('Error getting task:', error)
      return { success: false, errors: ['Failed to get task'] }
    }
  }

  // Get all tasks with filters
  async getTasks(filters: QueryFilters): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      const result = await this.taskRepo.findAllWithDetails(filters)
      const stats = await this.taskRepo.getTaskStats(filters.project_id, filters.assigned_to)
      
      return {
        success: true,
        data: {
          tasks: result.data,
          total: result.total,
          stats
        }
      }
    } catch (error) {
      console.error('Error getting tasks:', error)
      return { success: false, errors: ['Failed to get tasks'] }
    }
  }

  // Update task status with validation
  async updateTaskStatus(id: string, status: string, userId: string): Promise<{ success: boolean; data?: Task; errors?: string[] }> {
    try {
      const validStatuses = ['todo', 'in-progress', 'review', 'done', 'blocked']
      if (!validStatuses.includes(status)) {
        return { success: false, errors: ['Invalid status'] }
      }

      const existingTask = await this.taskRepo.findById(id)
      if (!existingTask) {
        return { success: false, errors: ['Task not found'] }
      }

      const task = await this.taskRepo.updateStatus(id, status, userId)
      if (!task) {
        return { success: false, errors: ['Failed to update task status'] }
      }

      // Update project progress
      await this.updateProjectProgress(task.project_id)

      // Log activity
      await this.activityLogger.log({
        user_id: userId,
        action: 'changed_task_status',
        entity_type: 'task',
        entity_id: task.id,
        entity_name: task.title,
        description: `Changed task "${task.title}" status to ${status}`
      })

      // Send notifications based on status change
      if (status === 'done') {
        await this.notificationService.notifyTaskCompleted(task, userId)
      } else if (status === 'blocked') {
        await this.notificationService.notifyTaskBlocked(task, userId)
      }

      return { success: true, data: task }
    } catch (error) {
      console.error('Error updating task status:', error)
      return { success: false, errors: ['Failed to update task status'] }
    }
  }

  // Delete task with validation
  async deleteTask(id: string, userId: string): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const task = await this.taskRepo.findById(id)
      if (!task) {
        return { success: false, errors: ['Task not found'] }
      }

      // Check if task has subtasks
      const subtasks = await this.taskRepo.findAll({ parent_task_id: id })
      if (subtasks.total > 0) {
        return { success: false, errors: ['Cannot delete task with subtasks. Delete subtasks first or reassign them.'] }
      }

      const success = await this.taskRepo.delete(id)
      if (!success) {
        return { success: false, errors: ['Failed to delete task'] }
      }

      // Update project progress
      await this.updateProjectProgress(task.project_id)

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

  // Get upcoming deadlines
  async getUpcomingDeadlines(userId?: string, days: number = 7): Promise<{ success: boolean; data?: Task[]; errors?: string[] }> {
    try {
      const deadlines = await this.taskRepo.getUpcomingDeadlines(userId, days)
      return { success: true, data: deadlines }
    } catch (error) {
      console.error('Error getting upcoming deadlines:', error)
      return { success: false, errors: ['Failed to get upcoming deadlines'] }
    }
  }

  // Get tasks for user dashboard
  async getUserDashboardTasks(userId: string): Promise<{ success: boolean; data?: any; errors?: string[] }> {
    try {
      const assignedTasks = await this.taskRepo.getTasksForUser(userId)
      const upcomingDeadlines = await this.taskRepo.getUpcomingDeadlines(userId, 7)
      const stats = await this.taskRepo.getTaskStats(undefined, userId)

      return {
        success: true,
        data: {
          assigned_tasks: assignedTasks.slice(0, 5),
          upcoming_deadlines: upcomingDeadlines,
          stats
        }
      }
    } catch (error) {
      console.error('Error getting user dashboard tasks:', error)
      return { success: false, errors: ['Failed to get user dashboard tasks'] }
    }
  }

  // Helper method to update project progress based on task completion
  private async updateProjectProgress(projectId: string): Promise<void> {
    try {
      const taskStats = await this.taskRepo.getTaskStats(projectId)
      if (taskStats.total_tasks > 0) {
        const progress = Math.round((taskStats.done_tasks / taskStats.total_tasks) * 100)
        await this.projectRepo.updateProgress(projectId, progress)
      }
    } catch (error) {
      console.error('Error updating project progress:', error)
    }
  }
}
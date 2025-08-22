import { db } from '../database'
import { Notification, Project, Task } from '../models'

export class NotificationService {

  // Create notification
  async createNotification(notification: {
    user_id: string
    title: string
    message: string
    notification_type?: 'info' | 'success' | 'warning' | 'error'
    entity_type?: string
    entity_id?: string
    action_url?: string
  }): Promise<void> {
    try {
      const query = `
        INSERT INTO notifications (user_id, title, message, notification_type, entity_type, entity_id, action_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `
      await db.query(query, [
        notification.user_id,
        notification.title,
        notification.message,
        notification.notification_type || 'info',
        notification.entity_type,
        notification.entity_id,
        notification.action_url
      ])
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }

  // Notify new project creation
  async notifyNewProject(project: Project, creatorId: string): Promise<void> {
    try {
      // Get team leads and managers
      const query = `
        SELECT id FROM users 
        WHERE role IN ('admin', 'manager') AND id != $1 AND is_active = true
      `
      const result = await db.query(query, [creatorId])
      
      for (const user of result.rows) {
        await this.createNotification({
          user_id: user.id,
          title: 'New Project Created',
          message: `A new project "${project.name}" has been created`,
          notification_type: 'info',
          entity_type: 'project',
          entity_id: project.id,
          action_url: `/projects/${project.id}`
        })
      }
    } catch (error) {
      console.error('Error notifying new project:', error)
    }
  }

  // Notify project update
  async notifyProjectUpdate(project: Project, updaterId: string, changes: any): Promise<void> {
    try {
      // Get project members
      const query = `
        SELECT user_id FROM project_members 
        WHERE project_id = $1 AND user_id != $2
      `
      const result = await db.query(query, [project.id, updaterId])
      
      let message = `Project "${project.name}" has been updated`
      if (changes.status) {
        message += ` - Status changed to ${changes.status}`
      }
      if (changes.due_date) {
        message += ` - Due date updated`
      }

      for (const member of result.rows) {
        await this.createNotification({
          user_id: member.user_id,
          title: 'Project Updated',
          message,
          notification_type: 'info',
          entity_type: 'project',
          entity_id: project.id,
          action_url: `/projects/${project.id}`
        })
      }
    } catch (error) {
      console.error('Error notifying project update:', error)
    }
  }

  // Notify task assignment
  async notifyTaskAssigned(task: Task, assigneeId: string, assignerId: string): Promise<void> {
    try {
      await this.createNotification({
        user_id: assigneeId,
        title: 'New Task Assigned',
        message: `You have been assigned the task "${task.title}"`,
        notification_type: 'info',
        entity_type: 'task',
        entity_id: task.id,
        action_url: `/tasks/${task.id}`
      })
    } catch (error) {
      console.error('Error notifying task assignment:', error)
    }
  }

  // Notify task update
  async notifyTaskUpdate(task: Task, updaterId: string, changes: any): Promise<void> {
    try {
      const notifyUsers: string[] = []
      
      // Notify assignee if not the updater
      if (task.assigned_to && task.assigned_to !== updaterId) {
        notifyUsers.push(task.assigned_to)
      }
      
      // Notify creator if not the updater
      if (task.created_by && task.created_by !== updaterId) {
        notifyUsers.push(task.created_by)
      }

      let message = `Task "${task.title}" has been updated`
      if (changes.status) {
        message += ` - Status changed to ${changes.status}`
      }
      if (changes.assigned_to) {
        message += ` - Reassigned`
      }

      for (const userId of [...new Set(notifyUsers)]) {
        await this.createNotification({
          user_id: userId,
          title: 'Task Updated',
          message,
          notification_type: 'info',
          entity_type: 'task',
          entity_id: task.id,
          action_url: `/tasks/${task.id}`
        })
      }
    } catch (error) {
      console.error('Error notifying task update:', error)
    }
  }

  // Notify team member added
  async notifyTeamMemberAdded(project: Project, newMemberId: string, adderId: string): Promise<void> {
    try {
      await this.createNotification({
        user_id: newMemberId,
        title: 'Added to Project',
        message: `You have been added to the project "${project.name}"`,
        notification_type: 'success',
        entity_type: 'project',
        entity_id: project.id,
        action_url: `/projects/${project.id}`
      })
    } catch (error) {
      console.error('Error notifying team member added:', error)
    }
  }

  // Get user notifications
  async getUserNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
    try {
      const query = `
        SELECT * FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `
      const result = await db.query(query, [userId, limit])
      return result.rows
    } catch (error) {
      console.error('Error getting user notifications:', error)
      return []
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = true
        WHERE id = $1
      `
      const result = await db.query(query, [notificationId])
      return result.rowCount !== null && result.rowCount > 0
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  // Mark all notifications as read for user
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = true
        WHERE user_id = $1 AND is_read = false
      `
      const result = await db.query(query, [userId])
      return result.rowCount !== null && result.rowCount > 0
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }
}
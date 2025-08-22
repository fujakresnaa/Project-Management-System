import { db } from '../database'
import { Project, Task, User } from '../models'

export class NotificationService {
  async createNotification(data: {
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
        data.user_id,
        data.title,
        data.message,
        data.notification_type || 'info',
        data.entity_type || null,
        data.entity_id || null,
        data.action_url || null
      ])
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }

  async notifyNewProject(project: Project, creatorId: string): Promise<void> {
    try {
      // Notify team leads and managers about new project
      const query = `
        SELECT id FROM users 
        WHERE role IN ('admin', 'manager') 
        AND id != $1 
        AND is_active = true
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

  async notifyProjectUpdate(project: Project, updaterId: string, changes: any): Promise<void> {
    try {
      // Get project members
      const members = await db.query(`
        SELECT DISTINCT user_id FROM project_members 
        WHERE project_id = $1 AND user_id != $2
      `, [project.id, updaterId])

      let message = `Project "${project.name}" has been updated`
      if (changes.status) {
        message += ` - Status changed to ${changes.status}`
      }
      if (changes.due_date) {
        message += ` - Due date updated`
      }

      for (const member of members.rows) {
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

  async notifyTaskAssigned(task: Task, project: Project, assigneeId: string, assignerId: string): Promise<void> {
    try {
      await this.createNotification({
        user_id: assigneeId,
        title: 'New Task Assigned',
        message: `You have been assigned a new task: "${task.title}" in project "${project.name}"`,
        notification_type: 'info',
        entity_type: 'task',
        entity_id: task.id,
        action_url: `/tasks/${task.id}`
      })
    } catch (error) {
      console.error('Error notifying task assigned:', error)
    }
  }

  async notifyTaskReassigned(task: Task, newAssigneeId: string, reassignerId: string): Promise<void> {
    try {
      await this.createNotification({
        user_id: newAssigneeId,
        title: 'Task Reassigned',
        message: `Task "${task.title}" has been reassigned to you`,
        notification_type: 'info',
        entity_type: 'task',
        entity_id: task.id,
        action_url: `/tasks/${task.id}`
      })
    } catch (error) {
      console.error('Error notifying task reassigned:', error)
    }
  }

  async notifyTaskCompleted(task: Task, completerId: string): Promise<void> {
    try {
      // Notify project members about task completion
      const members = await db.query(`
        SELECT DISTINCT pm.user_id 
        FROM project_members pm
        JOIN tasks t ON pm.project_id = t.project_id
        WHERE t.id = $1 AND pm.user_id != $2
      `, [task.id, completerId])

      for (const member of members.rows) {
        await this.createNotification({
          user_id: member.user_id,
          title: 'Task Completed',
          message: `Task "${task.title}" has been completed`,
          notification_type: 'success',
          entity_type: 'task',
          entity_id: task.id,
          action_url: `/tasks/${task.id}`
        })
      }
    } catch (error) {
      console.error('Error notifying task completed:', error)
    }
  }

  async notifyTaskBlocked(task: Task, blockerId: string): Promise<void> {
    try {
      // Notify project managers about blocked task
      const managers = await db.query(`
        SELECT DISTINCT pm.user_id 
        FROM project_members pm
        JOIN tasks t ON pm.project_id = t.project_id
        WHERE t.id = $1 AND pm.role IN ('owner', 'manager') AND pm.user_id != $2
      `, [task.id, blockerId])

      for (const manager of managers.rows) {
        await this.createNotification({
          user_id: manager.user_id,
          title: 'Task Blocked',
          message: `Task "${task.title}" has been blocked and needs attention`,
          notification_type: 'warning',
          entity_type: 'task',
          entity_id: task.id,
          action_url: `/tasks/${task.id}`
        })
      }
    } catch (error) {
      console.error('Error notifying task blocked:', error)
    }
  }

  async notifyTaskDeadlineChanged(task: Task, changerId: string): Promise<void> {
    try {
      if (task.assigned_to && task.assigned_to !== changerId) {
        await this.createNotification({
          user_id: task.assigned_to,
          title: 'Task Deadline Updated',
          message: `Deadline for task "${task.title}" has been updated`,
          notification_type: 'warning',
          entity_type: 'task',
          entity_id: task.id,
          action_url: `/tasks/${task.id}`
        })
      }
    } catch (error) {
      console.error('Error notifying task deadline changed:', error)
    }
  }

  async notifyTeamMemberAdded(project: Project, newMemberId: string, adderId: string): Promise<void> {
    try {
      await this.createNotification({
        user_id: newMemberId,
        title: 'Added to Project',
        message: `You have been added to project "${project.name}"`,
        notification_type: 'success',
        entity_type: 'project',
        entity_id: project.id,
        action_url: `/projects/${project.id}`
      })
    } catch (error) {
      console.error('Error notifying team member added:', error)
    }
  }

  async getNotifications(userId: string, limit: number = 20): Promise<any[]> {
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
      console.error('Error getting notifications:', error)
      return []
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = true 
        WHERE id = $1 AND user_id = $2
      `
      const result = await db.query(query, [notificationId, userId])
      return result.rowCount !== null && result.rowCount > 0
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const query = `
        UPDATE notifications 
        SET is_read = true 
        WHERE user_id = $1 AND is_read = false
      `
      const result = await db.query(query, [userId])
      return result.rowCount !== null && result.rowCount >= 0
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const query = `
        SELECT COUNT(*) FROM notifications
        WHERE user_id = $1 AND is_read = false
      `
      const result = await db.query(query, [userId])
      return parseInt(result.rows[0].count) || 0
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }
}
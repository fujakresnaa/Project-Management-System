import { db } from '../database'
import { ActivityLog } from '../models'

export class ActivityLogger {
  
  // Log activity with proper error handling
  async log(activity: {
    user_id?: string
    action: string
    entity_type?: string
    entity_id?: string
    entity_name?: string
    description?: string
    metadata?: Record<string, any>
  }): Promise<void> {
    try {
      const query = `
        INSERT INTO activity_logs (user_id, action, entity_type, entity_id, entity_name, description, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `
      await db.query(query, [
        activity.user_id,
        activity.action,
        activity.entity_type,
        activity.entity_id,
        activity.entity_name,
        activity.description,
        activity.metadata ? JSON.stringify(activity.metadata) : null
      ])
    } catch (error) {
      console.error('Error logging activity:', error)
      // Don't throw error to prevent breaking main functionality
    }
  }

  // Get recent activity
  async getRecentActivity(limit: number = 10): Promise<ActivityLog[]> {
    try {
      const query = `
        SELECT 
          al.*,
          u.name as user_name,
          u.avatar as user_avatar
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT $1
      `
      const result = await db.query(query, [limit])
      return result.rows
    } catch (error) {
      console.error('Error getting recent activity:', error)
      return []
    }
  }

  // Get activity for specific entity
  async getEntityActivity(entityType: string, entityId: string, limit: number = 20): Promise<ActivityLog[]> {
    try {
      const query = `
        SELECT 
          al.*,
          u.name as user_name,
          u.avatar as user_avatar
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.entity_type = $1 AND al.entity_id = $2
        ORDER BY al.created_at DESC
        LIMIT $3
      `
      const result = await db.query(query, [entityType, entityId, limit])
      return result.rows
    } catch (error) {
      console.error('Error getting entity activity:', error)
      return []
    }
  }

  // Get user activity
  async getUserActivity(userId: string, limit: number = 20): Promise<ActivityLog[]> {
    try {
      const query = `
        SELECT 
          al.*,
          u.name as user_name,
          u.avatar as user_avatar
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.user_id = $1
        ORDER BY al.created_at DESC
        LIMIT $2
      `
      const result = await db.query(query, [userId, limit])
      return result.rows
    } catch (error) {
      console.error('Error getting user activity:', error)
      return []
    }
  }
}
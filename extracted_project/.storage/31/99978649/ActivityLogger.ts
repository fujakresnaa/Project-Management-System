import { db } from '../database'

interface ActivityLogData {
  user_id: string
  action: string
  entity_type?: string
  entity_id?: string
  entity_name?: string
  description: string
  metadata?: Record<string, any>
}

export class ActivityLogger {
  async log(data: ActivityLogData): Promise<void> {
    try {
      const query = `
        INSERT INTO activity_logs (user_id, action, entity_type, entity_id, entity_name, description, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `
      
      await db.query(query, [
        data.user_id,
        data.action,
        data.entity_type || null,
        data.entity_id || null,
        data.entity_name || null,
        data.description,
        data.metadata ? JSON.stringify(data.metadata) : null
      ])
    } catch (error) {
      console.error('Error logging activity:', error)
      // Don't throw error to prevent breaking the main flow
    }
  }

  async getRecentActivity(limit: number = 10, userId?: string): Promise<any[]> {
    try {
      let query = `
        SELECT 
          al.*,
          u.name as user_name,
          u.avatar as user_avatar
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
      `
      
      const params: any[] = []
      if (userId) {
        query += ' WHERE al.user_id = $1'
        params.push(userId)
      }
      
      query += ` ORDER BY al.created_at DESC LIMIT $${params.length + 1}`
      params.push(limit)
      
      const result = await db.query(query, params)
      return result.rows
    } catch (error) {
      console.error('Error getting recent activity:', error)
      return []
    }
  }

  async getUserActivity(userId: string, days: number = 30): Promise<any[]> {
    try {
      const query = `
        SELECT 
          al.*,
          u.name as user_name,
          u.avatar as user_avatar
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.user_id = $1 
        AND al.created_at >= NOW() - INTERVAL '${days} days'
        ORDER BY al.created_at DESC
      `
      
      const result = await db.query(query, [userId])
      return result.rows
    } catch (error) {
      console.error('Error getting user activity:', error)
      return []
    }
  }

  async getEntityActivity(entityType: string, entityId: string): Promise<any[]> {
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
      `
      
      const result = await db.query(query, [entityType, entityId])
      return result.rows
    } catch (error) {
      console.error('Error getting entity activity:', error)
      return []
    }
  }
}
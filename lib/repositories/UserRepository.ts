import { BaseRepository } from './BaseRepository'
import { User, QueryFilters } from '../models'
import { db } from '../database'

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users')
  }

  // Build search clause for users
  protected buildSearchClause(search: string, queryParams: any[], paramIndex: number): string {
    queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    return `WHERE (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex + 1} OR department ILIKE $${paramIndex + 2})`
  }

  // Build additional filters for users
  protected buildAdditionalFilters(filters: QueryFilters, queryParams: any[], paramIndex: number): string {
    const conditions: string[] = []
    
    if (filters.status) {
      queryParams.push(filters.status)
      conditions.push(`status = $${queryParams.length}`)
    }

    if (filters.department) {
      queryParams.push(filters.department)
      conditions.push(`department = $${queryParams.length}`)
    }

    return conditions.join(' AND ')
  }

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true'
      const result = await db.query(query, [email])
      return result.rows[0] || null
    } catch (error) {
      console.error('Error finding user by email:', error)
      throw error
    }
  }

  // Get user with settings
  async findByIdWithSettings(id: string): Promise<any | null> {
    try {
      const query = `
        SELECT 
          u.*,
          us.*
        FROM users u
        LEFT JOIN user_settings us ON u.id = us.user_id
        WHERE u.id = $1 AND u.is_active = true
      `
      const result = await db.query(query, [id])
      return result.rows[0] || null
    } catch (error) {
      console.error('Error finding user with settings:', error)
      throw error
    }
  }

  // Get team members with stats
  async getTeamMembersWithStats(): Promise<any[]> {
    try {
      const query = `
        SELECT 
          u.*,
          COUNT(DISTINCT pm.project_id) as active_projects,
          COUNT(DISTINCT t.id) as total_tasks,
          COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'done') as completed_tasks,
          MAX(al.created_at) as last_activity
        FROM users u
        LEFT JOIN project_members pm ON u.id = pm.user_id
        LEFT JOIN tasks t ON u.id = t.assigned_to
        LEFT JOIN activity_logs al ON u.id = al.user_id
        WHERE u.is_active = true
        GROUP BY u.id
        ORDER BY u.name
      `
      const result = await db.query(query)
      return result.rows
    } catch (error) {
      console.error('Error getting team members with stats:', error)
      throw error
    }
  }

  // Get dashboard metrics for users/team
  async getDashboardMetrics(): Promise<any> {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE is_active = true) as active_users,
          COUNT(*) FILTER (WHERE status = 'online') as online_users,
          COUNT(DISTINCT department) FILTER (WHERE department IS NOT NULL) as departments_count
        FROM users
      `
      const result = await db.query(query)
      
      // Get department breakdown
      const deptQuery = `
        SELECT 
          department,
          COUNT(*) as member_count
        FROM users 
        WHERE is_active = true AND department IS NOT NULL
        GROUP BY department
        ORDER BY member_count DESC
      `
      const deptResult = await db.query(deptQuery)
      
      return {
        ...result.rows[0],
        departments: deptResult.rows
      }
    } catch (error) {
      console.error('Error getting user dashboard metrics:', error)
      throw error
    }
  }

  // Get team performance metrics
  async getTeamPerformanceMetrics(): Promise<any[]> {
    try {
      const query = `
        SELECT 
          u.name,
          u.department,
          COUNT(t.id) as total_tasks,
          COUNT(t.id) FILTER (WHERE t.status = 'done') as completed_tasks,
          COUNT(t.id) FILTER (WHERE t.due_date < NOW() AND t.status != 'done') as overdue_tasks,
          AVG(CASE WHEN t.actual_hours IS NOT NULL THEN t.actual_hours ELSE NULL END) as avg_hours_per_task
        FROM users u
        LEFT JOIN tasks t ON u.id = t.assigned_to
        WHERE u.is_active = true
        GROUP BY u.id, u.name, u.department
        HAVING COUNT(t.id) > 0
        ORDER BY completed_tasks DESC
      `
      const result = await db.query(query)
      return result.rows
    } catch (error) {
      console.error('Error getting team performance metrics:', error)
      throw error
    }
  }

  // Update user status
  async updateStatus(userId: string, status: 'online' | 'away' | 'offline'): Promise<boolean> {
    try {
      const query = `
        UPDATE users 
        SET status = $1, updated_at = NOW()
        WHERE id = $2
      `
      const result = await db.query(query, [status, userId])
      return result.rowCount !== null && result.rowCount > 0
    } catch (error) {
      console.error('Error updating user status:', error)
      throw error
    }
  }

  // Get user settings
  async getUserSettings(userId: string): Promise<any | null> {
    try {
      const query = 'SELECT * FROM user_settings WHERE user_id = $1'
      const result = await db.query(query, [userId])
      return result.rows[0] || null
    } catch (error) {
      console.error('Error getting user settings:', error)
      throw error
    }
  }

  // Update user settings
  async updateUserSettings(userId: string, settings: any): Promise<boolean> {
    try {
      const keys = Object.keys(settings)
      const values = Object.values(settings)
      const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ')
      
      const query = `
        UPDATE user_settings 
        SET ${setClause}, updated_at = NOW()
        WHERE user_id = $1
      `
      const result = await db.query(query, [userId, ...values])
      return result.rowCount !== null && result.rowCount > 0
    } catch (error) {
      console.error('Error updating user settings:', error)
      throw error
    }
  }

  // Create default user settings
  async createDefaultSettings(userId: string): Promise<void> {
    try {
      const query = `
        INSERT INTO user_settings (user_id) 
        VALUES ($1)
        ON CONFLICT (user_id) DO NOTHING
      `
      await db.query(query, [userId])
    } catch (error) {
      console.error('Error creating default settings:', error)
      throw error
    }
  }
}
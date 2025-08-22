// User repository with authentication and user management
import { BaseRepository } from './BaseRepository'
import { User, QueryFilters } from '../models'
import { db } from '../database'
import bcrypt from 'bcryptjs'

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

  // Create user with hashed password
  async createUser(userData: Partial<User> & { password: string }): Promise<User> {
    try {
      const { password, ...userFields } = userData
      const password_hash = await bcrypt.hash(password, 12)
      
      const user = await this.create({
        ...userFields,
        password_hash
      } as Partial<User>)

      // Remove password hash from returned user
      const { password_hash: _, ...userWithoutPassword } = user as any
      return userWithoutPassword
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  // Verify password
  async verifyPassword(email: string, password: string): Promise<User | null> {
    try {
      const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true'
      const result = await db.query(query, [email])
      
      if (!result.rows[0]) {
        return null
      }

      const user = result.rows[0]
      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      
      if (!isValidPassword) {
        return null
      }

      // Update last login
      await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id])

      // Remove password hash from returned user
      const { password_hash: _, ...userWithoutPassword } = user
      return userWithoutPassword
    } catch (error) {
      console.error('Error verifying password:', error)
      throw error
    }
  }

  // Update password
  async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      const password_hash = await bcrypt.hash(newPassword, 12)
      const query = 'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2'
      const result = await db.query(query, [password_hash, userId])
      return result.rowCount !== null && result.rowCount > 0
    } catch (error) {
      console.error('Error updating password:', error)
      throw error
    }
  }

  // Update user status (online, away, offline)
  async updateStatus(userId: string, status: 'online' | 'away' | 'offline'): Promise<boolean> {
    try {
      const query = 'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2'
      const result = await db.query(query, [status, userId])
      return result.rowCount !== null && result.rowCount > 0
    } catch (error) {
      console.error('Error updating user status:', error)
      throw error
    }
  }

  // Get team statistics
  async getTeamStats(): Promise<any> {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_members,
          COUNT(*) FILTER (WHERE status = 'online') as online_members,
          COUNT(*) FILTER (WHERE status = 'away') as away_members,
          COUNT(*) FILTER (WHERE status = 'offline') as offline_members,
          COUNT(DISTINCT department) as departments
        FROM users 
        WHERE is_active = true
      `
      const result = await db.query(query)
      return result.rows[0]
    } catch (error) {
      console.error('Error getting team stats:', error)
      throw error
    }
  }

  // Get users by department
  async getUsersByDepartment(department: string): Promise<User[]> {
    try {
      const query = 'SELECT * FROM users WHERE department = $1 AND is_active = true ORDER BY name'
      const result = await db.query(query, [department])
      return result.rows
    } catch (error) {
      console.error('Error getting users by department:', error)
      throw error
    }
  }
}
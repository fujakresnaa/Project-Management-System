// Project repository with team member management
import { BaseRepository } from './BaseRepository'
import { Project, ProjectMember, QueryFilters } from '../models'
import { db } from '../database'

export class ProjectRepository extends BaseRepository<Project> {
  constructor() {
    super('projects')
  }

  // Build search clause for projects
  protected buildSearchClause(search: string, queryParams: any[], paramIndex: number): string {
    queryParams.push(`%${search}%`, `%${search}%`)
    return `WHERE (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex + 1})`
  }

  // Build additional filters for projects
  protected buildAdditionalFilters(filters: QueryFilters, queryParams: any[], paramIndex: number): string {
    const conditions: string[] = []
    
    if (filters.status) {
      queryParams.push(filters.status)
      conditions.push(`status = $${queryParams.length}`)
    }

    if (filters.priority) {
      queryParams.push(filters.priority)
      conditions.push(`priority = $${queryParams.length}`)
    }

    if (filters.created_by) {
      queryParams.push(filters.created_by)
      conditions.push(`created_by = $${queryParams.length}`)
    }

    return conditions.join(' AND ')
  }

  // Get project with team members
  async findByIdWithMembers(id: string): Promise<Project | null> {
    try {
      const query = `
        SELECT 
          p.*,
          COUNT(pm.user_id) as member_count,
          COUNT(t.id) as task_count,
          COUNT(t.id) FILTER (WHERE t.status = 'done') as completed_task_count
        FROM projects p
        LEFT JOIN project_members pm ON p.id = pm.project_id
        LEFT JOIN tasks t ON p.id = t.project_id
        WHERE p.id = $1
        GROUP BY p.id
      `
      const result = await db.query(query, [id])
      return result.rows[0] || null
    } catch (error) {
      console.error('Error finding project with members:', error)
      throw error
    }
  }

  // Get all projects with member counts
  async findAllWithStats(filters: QueryFilters = {}): Promise<{ data: Project[]; total: number }> {
    try {
      const { page = 1, limit = 20, search, sort_by = 'created_at', sort_order = 'desc' } = filters
      const offset = (page - 1) * limit

      // Build WHERE clause
      let whereClause = ''
      const queryParams: any[] = []
      let paramIndex = 1

      if (search) {
        whereClause = this.buildSearchClause(search, queryParams, paramIndex)
        paramIndex = queryParams.length + 1
      }

      const additionalWhere = this.buildAdditionalFilters(filters, queryParams, paramIndex)
      if (additionalWhere) {
        whereClause += whereClause ? ` AND ${additionalWhere}` : `WHERE ${additionalWhere}`
      }

      // Count query
      const countQuery = `SELECT COUNT(*) FROM projects p ${whereClause}`
      const countResult = await db.query(countQuery, queryParams)
      const total = parseInt(countResult.rows[0].count)

      // Data query with stats
      queryParams.push(limit, offset)
      const dataQuery = `
        SELECT 
          p.*,
          COUNT(pm.user_id) as member_count,
          COUNT(t.id) as task_count,
          COUNT(t.id) FILTER (WHERE t.status = 'done') as completed_task_count,
          u.name as created_by_name
        FROM projects p
        LEFT JOIN project_members pm ON p.id = pm.project_id
        LEFT JOIN tasks t ON p.id = t.project_id
        LEFT JOIN users u ON p.created_by = u.id
        ${whereClause} 
        GROUP BY p.id, u.name
        ORDER BY p.${sort_by} ${sort_order.toUpperCase()} 
        LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
      `
      const dataResult = await db.query(dataQuery, queryParams)

      return {
        data: dataResult.rows,
        total
      }
    } catch (error) {
      console.error('Error finding projects with stats:', error)
      throw error
    }
  }

  // Add team member to project
  async addMember(projectId: string, userId: string, role: string = 'member'): Promise<ProjectMember> {
    try {
      const query = `
        INSERT INTO project_members (project_id, user_id, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (project_id, user_id) 
        DO UPDATE SET role = $3, joined_at = NOW()
        RETURNING *
      `
      const result = await db.query(query, [projectId, userId, role])
      return result.rows[0]
    } catch (error) {
      console.error('Error adding project member:', error)
      throw error
    }
  }

  // Remove team member from project
  async removeMember(projectId: string, userId: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2'
      const result = await db.query(query, [projectId, userId])
      return result.rowCount !== null && result.rowCount > 0
    } catch (error) {
      console.error('Error removing project member:', error)
      throw error
    }
  }

  // Get project members
  async getMembers(projectId: string): Promise<ProjectMember[]> {
    try {
      const query = `
        SELECT 
          pm.*,
          u.name, u.email, u.avatar, u.title, u.department, u.status
        FROM project_members pm
        JOIN users u ON pm.user_id = u.id
        WHERE pm.project_id = $1 AND u.is_active = true
        ORDER BY pm.role, u.name
      `
      const result = await db.query(query, [projectId])
      return result.rows
    } catch (error) {
      console.error('Error getting project members:', error)
      throw error
    }
  }

  // Get projects for user
  async getProjectsForUser(userId: string): Promise<Project[]> {
    try {
      const query = `
        SELECT 
          p.*,
          pm.role as user_role,
          COUNT(t.id) as task_count,
          COUNT(t.id) FILTER (WHERE t.status = 'done') as completed_task_count
        FROM projects p
        JOIN project_members pm ON p.id = pm.project_id
        LEFT JOIN tasks t ON p.id = t.project_id
        WHERE pm.user_id = $1
        GROUP BY p.id, pm.role
        ORDER BY p.updated_at DESC
      `
      const result = await db.query(query, [userId])
      return result.rows
    } catch (error) {
      console.error('Error getting projects for user:', error)
      throw error
    }
  }

  // Update project progress
  async updateProgress(projectId: string, progress: number): Promise<Project | null> {
    try {
      const query = `
        UPDATE projects 
        SET progress = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `
      const result = await db.query(query, [progress, projectId])
      return result.rows[0] || null
    } catch (error) {
      console.error('Error updating project progress:', error)
      throw error
    }
  }

  // Get dashboard metrics
  async getDashboardMetrics(): Promise<any> {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_projects,
          COUNT(*) FILTER (WHERE status = 'active') as active_projects,
          COUNT(*) FILTER (WHERE status = 'completed') as completed_projects,
          COUNT(*) FILTER (WHERE status = 'on-hold') as on_hold_projects,
          AVG(progress) as avg_progress,
          COUNT(*) FILTER (WHERE due_date < NOW() AND status != 'completed') as overdue_projects
        FROM projects
      `
      const result = await db.query(query)
      return result.rows[0]
    } catch (error) {
      console.error('Error getting project dashboard metrics:', error)
      throw error
    }
  }
}
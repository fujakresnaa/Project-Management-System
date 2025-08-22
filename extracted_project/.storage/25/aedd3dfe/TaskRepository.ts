// Task repository with project and user relationships
import { BaseRepository } from './BaseRepository'
import { Task, QueryFilters } from '../models'
import { db } from '../database'

export class TaskRepository extends BaseRepository<Task> {
  constructor() {
    super('tasks')
  }

  // Build search clause for tasks
  protected buildSearchClause(search: string, queryParams: any[], paramIndex: number): string {
    queryParams.push(`%${search}%`, `%${search}%`)
    return `WHERE (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex + 1})`
  }

  // Build additional filters for tasks
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

    if (filters.project_id) {
      queryParams.push(filters.project_id)
      conditions.push(`project_id = $${queryParams.length}`)
    }

    if (filters.assigned_to) {
      queryParams.push(filters.assigned_to)
      conditions.push(`assigned_to = $${queryParams.length}`)
    }

    if (filters.created_by) {
      queryParams.push(filters.created_by)
      conditions.push(`created_by = $${queryParams.length}`)
    }

    return conditions.join(' AND ')
  }

  // Get task with full details
  async findByIdWithDetails(id: string): Promise<Task | null> {
    try {
      const query = `
        SELECT 
          t.*,
          p.name as project_name,
          p.status as project_status,
          ua.name as assignee_name,
          ua.email as assignee_email,
          ua.avatar as assignee_avatar,
          uc.name as creator_name,
          uc.email as creator_email,
          ARRAY_AGG(DISTINCT tt.tag_name) FILTER (WHERE tt.tag_name IS NOT NULL) as tags,
          COUNT(c.id) as comment_count
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN users ua ON t.assigned_to = ua.id
        LEFT JOIN users uc ON t.created_by = uc.id
        LEFT JOIN task_tags tt ON t.id = tt.task_id
        LEFT JOIN comments c ON t.id = c.entity_id AND c.entity_type = 'task'
        WHERE t.id = $1
        GROUP BY t.id, p.name, p.status, ua.name, ua.email, ua.avatar, uc.name, uc.email
      `
      const result = await db.query(query, [id])
      return result.rows[0] || null
    } catch (error) {
      console.error('Error finding task with details:', error)
      throw error
    }
  }

  // Get all tasks with details
  async findAllWithDetails(filters: QueryFilters = {}): Promise<{ data: Task[]; total: number }> {
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
      const countQuery = `SELECT COUNT(*) FROM tasks t ${whereClause}`
      const countResult = await db.query(countQuery, queryParams)
      const total = parseInt(countResult.rows[0].count)

      // Data query
      queryParams.push(limit, offset)
      const dataQuery = `
        SELECT 
          t.*,
          p.name as project_name,
          p.status as project_status,
          ua.name as assignee_name,
          ua.email as assignee_email,
          ua.avatar as assignee_avatar,
          uc.name as creator_name,
          uc.email as creator_email,
          ARRAY_AGG(DISTINCT tt.tag_name) FILTER (WHERE tt.tag_name IS NOT NULL) as tags,
          COUNT(c.id) as comment_count
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN users ua ON t.assigned_to = ua.id
        LEFT JOIN users uc ON t.created_by = uc.id
        LEFT JOIN task_tags tt ON t.id = tt.task_id
        LEFT JOIN comments c ON t.id = c.entity_id AND c.entity_type = 'task'
        ${whereClause} 
        GROUP BY t.id, p.name, p.status, ua.name, ua.email, ua.avatar, uc.name, uc.email
        ORDER BY t.${sort_by} ${sort_order.toUpperCase()} 
        LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
      `
      const dataResult = await db.query(dataQuery, queryParams)

      return {
        data: dataResult.rows,
        total
      }
    } catch (error) {
      console.error('Error finding tasks with details:', error)
      throw error
    }
  }

  // Get tasks by project
  async getTasksByProject(projectId: string, status?: string): Promise<Task[]> {
    try {
      let query = `
        SELECT 
          t.*,
          ua.name as assignee_name,
          ua.email as assignee_email,
          ua.avatar as assignee_avatar,
          ARRAY_AGG(DISTINCT tt.tag_name) FILTER (WHERE tt.tag_name IS NOT NULL) as tags
        FROM tasks t
        LEFT JOIN users ua ON t.assigned_to = ua.id
        LEFT JOIN task_tags tt ON t.id = tt.task_id
        WHERE t.project_id = $1
      `
      
      const params = [projectId]
      if (status) {
        query += ' AND t.status = $2'
        params.push(status)
      }
      
      query += ' GROUP BY t.id, ua.name, ua.email, ua.avatar ORDER BY t.created_at DESC'
      
      const result = await db.query(query, params)
      return result.rows
    } catch (error) {
      console.error('Error getting tasks by project:', error)
      throw error
    }
  }

  // Get tasks assigned to user
  async getTasksForUser(userId: string, status?: string): Promise<Task[]> {
    try {
      let query = `
        SELECT 
          t.*,
          p.name as project_name,
          p.status as project_status,
          ARRAY_AGG(DISTINCT tt.tag_name) FILTER (WHERE tt.tag_name IS NOT NULL) as tags
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN task_tags tt ON t.id = tt.task_id
        WHERE t.assigned_to = $1
      `
      
      const params = [userId]
      if (status) {
        query += ' AND t.status = $2'
        params.push(status)
      }
      
      query += ' GROUP BY t.id, p.name, p.status ORDER BY t.due_date ASC NULLS LAST'
      
      const result = await db.query(query, params)
      return result.rows
    } catch (error) {
      console.error('Error getting tasks for user:', error)
      throw error
    }
  }

  // Add tags to task
  async addTags(taskId: string, tags: string[]): Promise<void> {
    try {
      if (!tags.length) return

      const values = tags.map((tag, index) => `($1, $${index + 2})`).join(', ')
      const query = `
        INSERT INTO task_tags (task_id, tag_name) 
        VALUES ${values}
        ON CONFLICT (task_id, tag_name) DO NOTHING
      `
      
      await db.query(query, [taskId, ...tags])
    } catch (error) {
      console.error('Error adding task tags:', error)
      throw error
    }
  }

  // Remove tags from task
  async removeTags(taskId: string, tags: string[]): Promise<void> {
    try {
      if (!tags.length) return

      const placeholders = tags.map((_, index) => `$${index + 2}`).join(', ')
      const query = `
        DELETE FROM task_tags 
        WHERE task_id = $1 AND tag_name IN (${placeholders})
      `
      
      await db.query(query, [taskId, ...tags])
    } catch (error) {
      console.error('Error removing task tags:', error)
      throw error
    }
  }

  // Update task status
  async updateStatus(taskId: string, status: string, userId?: string): Promise<Task | null> {
    try {
      let query = `
        UPDATE tasks 
        SET status = $1, updated_at = NOW()
      `
      const params = [status, taskId]
      
      if (status === 'done') {
        query += ', completed_at = NOW()'
      }
      
      query += ' WHERE id = $2 RETURNING *'
      
      const result = await db.query(query, params)
      return result.rows[0] || null
    } catch (error) {
      console.error('Error updating task status:', error)
      throw error
    }
  }

  // Get task statistics
  async getTaskStats(projectId?: string, userId?: string): Promise<any> {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_tasks,
          COUNT(*) FILTER (WHERE status = 'todo') as todo_tasks,
          COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress_tasks,
          COUNT(*) FILTER (WHERE status = 'review') as review_tasks,
          COUNT(*) FILTER (WHERE status = 'done') as done_tasks,
          COUNT(*) FILTER (WHERE due_date < NOW() AND status != 'done') as overdue_tasks,
          AVG(actual_hours) as avg_actual_hours,
          AVG(estimated_hours) as avg_estimated_hours
        FROM tasks
        WHERE 1=1
      `
      
      const params: any[] = []
      if (projectId) {
        params.push(projectId)
        query += ` AND project_id = $${params.length}`
      }
      
      if (userId) {
        params.push(userId)
        query += ` AND assigned_to = $${params.length}`
      }
      
      const result = await db.query(query, params)
      return result.rows[0]
    } catch (error) {
      console.error('Error getting task stats:', error)
      throw error
    }
  }

  // Get upcoming deadlines
  async getUpcomingDeadlines(userId?: string, days: number = 7): Promise<Task[]> {
    try {
      let query = `
        SELECT 
          t.*,
          p.name as project_name,
          ua.name as assignee_name
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN users ua ON t.assigned_to = ua.id
        WHERE t.due_date BETWEEN NOW() AND NOW() + INTERVAL '${days} days'
        AND t.status != 'done'
      `
      
      const params: any[] = []
      if (userId) {
        params.push(userId)
        query += ` AND t.assigned_to = $${params.length}`
      }
      
      query += ' ORDER BY t.due_date ASC'
      
      const result = await db.query(query, params)
      return result.rows
    } catch (error) {
      console.error('Error getting upcoming deadlines:', error)
      throw error
    }
  }
}
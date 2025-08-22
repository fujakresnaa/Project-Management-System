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
      conditions.push(`t.status = $${queryParams.length}`)
    }

    if (filters.priority) {
      queryParams.push(filters.priority)
      conditions.push(`t.priority = $${queryParams.length}`)
    }

    if (filters.project_id) {
      queryParams.push(filters.project_id)
      conditions.push(`t.project_id = $${queryParams.length}`)
    }

    if (filters.assigned_to) {
      queryParams.push(filters.assigned_to)
      conditions.push(`t.assigned_to = $${queryParams.length}`)
    }

    if (filters.created_by) {
      queryParams.push(filters.created_by)
      conditions.push(`t.created_by = $${queryParams.length}`)
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
          u1.name as assignee_name,
          u1.avatar as assignee_avatar,
          u2.name as creator_name,
          u2.avatar as creator_avatar,
          COUNT(c.id) as comment_count
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN users u1 ON t.assigned_to = u1.id
        LEFT JOIN users u2 ON t.created_by = u2.id
        LEFT JOIN comments c ON c.entity_type = 'task' AND c.entity_id = t.id
        WHERE t.id = $1
        GROUP BY t.id, p.name, u1.name, u1.avatar, u2.name, u2.avatar
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

      // Data query with details
      queryParams.push(limit, offset)
      const dataQuery = `
        SELECT 
          t.*,
          p.name as project_name,
          u1.name as assignee_name,
          u1.avatar as assignee_avatar,
          u2.name as creator_name,
          COUNT(c.id) as comment_count
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN users u1 ON t.assigned_to = u1.id
        LEFT JOIN users u2 ON t.created_by = u2.id
        LEFT JOIN comments c ON c.entity_type = 'task' AND c.entity_id = t.id
        ${whereClause}
        GROUP BY t.id, p.name, u1.name, u1.avatar, u2.name
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
  async getTasksByProject(projectId: string): Promise<Task[]> {
    try {
      const query = `
        SELECT 
          t.*,
          u1.name as assignee_name,
          u1.avatar as assignee_avatar
        FROM tasks t
        LEFT JOIN users u1 ON t.assigned_to = u1.id
        WHERE t.project_id = $1
        ORDER BY t.created_at DESC
      `
      const result = await db.query(query, [projectId])
      return result.rows
    } catch (error) {
      console.error('Error getting tasks by project:', error)
      throw error
    }
  }

  // Get task statistics for a project
  async getTaskStats(projectId: string): Promise<any> {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_tasks,
          COUNT(*) FILTER (WHERE status = 'done') as done_tasks,
          COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress_tasks,
          COUNT(*) FILTER (WHERE status = 'todo') as todo_tasks,
          COUNT(*) FILTER (WHERE status = 'blocked') as blocked_tasks,
          COUNT(*) FILTER (WHERE due_date < NOW() AND status != 'done') as overdue_tasks
        FROM tasks
        WHERE project_id = $1
      `
      const result = await db.query(query, [projectId])
      return result.rows[0]
    } catch (error) {
      console.error('Error getting task stats:', error)
      throw error
    }
  }

  // Add tags to task
  async addTags(taskId: string, tags: string[]): Promise<void> {
    try {
      const values = tags.map(tag => `('${taskId}', '${tag}')`).join(', ')
      const query = `
        INSERT INTO task_tags (task_id, tag_name)
        VALUES ${values}
        ON CONFLICT (task_id, tag_name) DO NOTHING
      `
      await db.query(query)
    } catch (error) {
      console.error('Error adding task tags:', error)
      throw error
    }
  }

  // Update task tags
  async updateTags(taskId: string, tags: string[]): Promise<void> {
    try {
      await db.transaction(async (client) => {
        // Remove existing tags
        await client.query('DELETE FROM task_tags WHERE task_id = $1', [taskId])
        
        // Add new tags
        if (tags.length > 0) {
          const values = tags.map(tag => `('${taskId}', '${tag}')`).join(', ')
          const query = `INSERT INTO task_tags (task_id, tag_name) VALUES ${values}`
          await client.query(query)
        }
      })
    } catch (error) {
      console.error('Error updating task tags:', error)
      throw error
    }
  }

  // Get task tags
  async getTags(taskId: string): Promise<string[]> {
    try {
      const query = 'SELECT tag_name FROM task_tags WHERE task_id = $1'
      const result = await db.query(query, [taskId])
      return result.rows.map(row => row.tag_name)
    } catch (error) {
      console.error('Error getting task tags:', error)
      throw error
    }
  }

  // Get upcoming tasks
  async findUpcomingTasks(days: number = 7, userId?: string): Promise<Task[]> {
    try {
      let query = `
        SELECT 
          t.*,
          p.name as project_name,
          u1.name as assignee_name
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN users u1 ON t.assigned_to = u1.id
        WHERE t.due_date BETWEEN NOW() AND NOW() + INTERVAL '${days} days'
        AND t.status != 'done'
      `
      
      const params = []
      if (userId) {
        query += ' AND t.assigned_to = $1'
        params.push(userId)
      }
      
      query += ' ORDER BY t.due_date ASC'
      
      const result = await db.query(query, params)
      return result.rows
    } catch (error) {
      console.error('Error getting upcoming tasks:', error)
      throw error
    }
  }

  // Get dashboard metrics
  async getDashboardMetrics(): Promise<any> {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_tasks,
          COUNT(*) FILTER (WHERE status = 'done') as completed_tasks,
          COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress_tasks,
          COUNT(*) FILTER (WHERE status = 'todo') as todo_tasks,
          COUNT(*) FILTER (WHERE status = 'blocked') as blocked_tasks,
          COUNT(*) FILTER (WHERE due_date < NOW() AND status != 'done') as overdue_tasks,
          COUNT(*) FILTER (WHERE due_date BETWEEN NOW() AND NOW() + INTERVAL '7 days' AND status != 'done') as upcoming_deadlines
        FROM tasks
      `
      const result = await db.query(query)
      return result.rows[0]
    } catch (error) {
      console.error('Error getting task dashboard metrics:', error)
      throw error
    }
  }

  // Get task completion trend
  async getCompletionTrend(): Promise<any[]> {
    try {
      const query = `
        SELECT 
          DATE(completed_at) as date,
          COUNT(*) as completed_count
        FROM tasks
        WHERE completed_at >= NOW() - INTERVAL '30 days'
        AND status = 'done'
        GROUP BY DATE(completed_at)
        ORDER BY date DESC
      `
      const result = await db.query(query)
      return result.rows
    } catch (error) {
      console.error('Error getting completion trend:', error)
      throw error
    }
  }

  // Get workload distribution
  async getWorkloadDistribution(): Promise<any[]> {
    try {
      const query = `
        SELECT 
          u.name,
          COUNT(t.id) as task_count,
          COUNT(t.id) FILTER (WHERE t.status = 'done') as completed_count
        FROM users u
        LEFT JOIN tasks t ON u.id = t.assigned_to
        WHERE u.is_active = true
        GROUP BY u.id, u.name
        ORDER BY task_count DESC
      `
      const result = await db.query(query)
      return result.rows
    } catch (error) {
      console.error('Error getting workload distribution:', error)
      throw error
    }
  }

  // Get comments for task
  async getComments(taskId: string): Promise<any[]> {
    try {
      const query = `
        SELECT 
          c.*,
          u.name as author_name,
          u.avatar as author_avatar
        FROM comments c
        LEFT JOIN users u ON c.created_by = u.id
        WHERE c.entity_type = 'task' AND c.entity_id = $1
        ORDER BY c.created_at ASC
      `
      const result = await db.query(query, [taskId])
      return result.rows
    } catch (error) {
      console.error('Error getting task comments:', error)
      throw error
    }
  }
}
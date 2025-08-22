import { db } from '../database'
import { QueryFilters } from '../models'

export abstract class BaseRepository<T> {
  protected tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  // Abstract methods to be implemented by child classes
  protected abstract buildSearchClause(search: string, queryParams: any[], paramIndex: number): string
  protected abstract buildAdditionalFilters(filters: QueryFilters, queryParams: any[], paramIndex: number): string

  // Generic create method
  async create(data: Partial<T>): Promise<T> {
    try {
      const keys = Object.keys(data).join(', ')
      const values = Object.values(data)
      const placeholders = values.map((_, index) => `$${index + 1}`).join(', ')
      
      const query = `
        INSERT INTO ${this.tableName} (${keys})
        VALUES (${placeholders})
        RETURNING *
      `
      const result = await db.query(query, values)
      return result.rows[0]
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error)
      throw error
    }
  }

  // Generic find by ID method
  async findById(id: string): Promise<T | null> {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE id = $1`
      const result = await db.query(query, [id])
      return result.rows[0] || null
    } catch (error) {
      console.error(`Error finding ${this.tableName} by ID:`, error)
      throw error
    }
  }

  // Generic update method
  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      const keys = Object.keys(data)
      const values = Object.values(data)
      const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ')
      
      const query = `
        UPDATE ${this.tableName} 
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `
      const result = await db.query(query, [id, ...values])
      return result.rows[0] || null
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error)
      throw error
    }
  }

  // Generic delete method
  async delete(id: string): Promise<boolean> {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE id = $1`
      const result = await db.query(query, [id])
      return result.rowCount !== null && result.rowCount > 0
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error)
      throw error
    }
  }

  // Generic find all with pagination
  async findAll(filters: QueryFilters = {}): Promise<{ data: T[]; total: number }> {
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
      const countQuery = `SELECT COUNT(*) FROM ${this.tableName} ${whereClause}`
      const countResult = await db.query(countQuery, queryParams)
      const total = parseInt(countResult.rows[0].count)

      // Data query
      queryParams.push(limit, offset)
      const dataQuery = `
        SELECT * FROM ${this.tableName} 
        ${whereClause} 
        ORDER BY ${sort_by} ${sort_order.toUpperCase()} 
        LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
      `
      const dataResult = await db.query(dataQuery, queryParams)

      return {
        data: dataResult.rows,
        total
      }
    } catch (error) {
      console.error(`Error finding all ${this.tableName}:`, error)
      throw error
    }
  }
}
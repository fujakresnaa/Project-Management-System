// Base repository class with common CRUD operations
import { db } from '../database'
import { QueryResult } from 'pg'
import { QueryFilters } from '../models'

export abstract class BaseRepository<T> {
  protected tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  // Generic find by ID
  async findById(id: string): Promise<T | null> {
    try {
      const query = `SELECT * FROM ${this.tableName} WHERE id = $1`
      const result: QueryResult = await db.query(query, [id])
      return result.rows[0] || null
    } catch (error) {
      console.error(`Error finding ${this.tableName} by ID:`, error)
      throw error
    }
  }

  // Generic find all with pagination and filters
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

      // Add additional filters
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

  // Generic create
  async create(data: Partial<T>): Promise<T> {
    try {
      const fields = Object.keys(data).filter(key => key !== 'id')
      const values = fields.map(field => (data as any)[field])
      const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ')

      const query = `
        INSERT INTO ${this.tableName} (${fields.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `
      
      const result: QueryResult = await db.query(query, values)
      return result.rows[0]
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error)
      throw error
    }
  }

  // Generic update
  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      const fields = Object.keys(data).filter(key => key !== 'id')
      const values = fields.map(field => (data as any)[field])
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ')

      values.push(id)
      const query = `
        UPDATE ${this.tableName} 
        SET ${setClause}
        WHERE id = $${values.length}
        RETURNING *
      `
      
      const result: QueryResult = await db.query(query, values)
      return result.rows[0] || null
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error)
      throw error
    }
  }

  // Generic delete
  async delete(id: string): Promise<boolean> {
    try {
      const query = `DELETE FROM ${this.tableName} WHERE id = $1`
      const result: QueryResult = await db.query(query, [id])
      return result.rowCount !== null && result.rowCount > 0
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error)
      throw error
    }
  }

  // Generic soft delete (if the table has is_active column)
  async softDelete(id: string): Promise<T | null> {
    try {
      const query = `
        UPDATE ${this.tableName} 
        SET is_active = false, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `
      const result: QueryResult = await db.query(query, [id])
      return result.rows[0] || null
    } catch (error) {
      console.error(`Error soft deleting ${this.tableName}:`, error)
      throw error
    }
  }

  // Abstract methods to be implemented by child classes
  protected abstract buildSearchClause(search: string, queryParams: any[], paramIndex: number): string
  protected buildAdditionalFilters(filters: QueryFilters, queryParams: any[], paramIndex: number): string {
    return ''
  }

  // Helper method to build parameterized queries
  protected addFilter(
    condition: string, 
    value: any, 
    queryParams: any[], 
    paramIndex: number
  ): { condition: string; paramIndex: number } {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.push(value)
      return {
        condition: condition.replace('?', `$${paramIndex}`),
        paramIndex: paramIndex + 1
      }
    }
    return { condition: '', paramIndex }
  }

  // Helper method to build ILIKE conditions for search
  protected buildILikeCondition(fields: string[], search: string): string {
    return fields.map(field => `${field} ILIKE '%${search}%'`).join(' OR ')
  }
}
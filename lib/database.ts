import { Pool } from 'pg'

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'avencia_pm',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

// Create connection pool
export const db = new Pool(dbConfig)

// Test connection and handle errors gracefully
db.on('error', (err) => {
  console.error('Unexpected database error:', err)
})

// Transaction helper
db.transaction = async (callback: (client: any) => Promise<any>) => {
  const client = await db.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Database initialization check
export async function initDB() {
  try {
    const client = await db.connect()
    console.log('✅ Database connected successfully')
    client.release()
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    console.log('💡 Make sure PostgreSQL is running and configured correctly')
    console.log('💡 Or update .env.local with correct database credentials')
  }
}
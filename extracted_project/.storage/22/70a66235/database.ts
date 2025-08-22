// Database configuration and connection
import { Pool, PoolClient, QueryResult } from 'pg'

interface DatabaseConfig {
  user: string
  host: string
  database: string
  password: string
  port: number
}

// Database connection configuration
const dbConfig: DatabaseConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'avencia_pm',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432')
}

// Create connection pool
const pool = new Pool(dbConfig)

// Database connection wrapper
export class Database {
  private static instance: Database
  private pool: Pool

  private constructor() {
    this.pool = pool
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  public async query(text: string, params?: any[]): Promise<QueryResult> {
    const client: PoolClient = await this.pool.connect()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client: PoolClient = await this.pool.connect()
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

  public async close(): Promise<void> {
    await this.pool.end()
  }
}

// Export singleton instance
export const db = Database.getInstance()

// Database initialization SQL
export const initializeDatabase = async (): Promise<void> => {
  const client = await pool.connect()
  
  try {
    // Create database tables with proper relationships and indexes
    await client.query(`
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar VARCHAR(500),
        role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
        department VARCHAR(100),
        title VARCHAR(100),
        status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'away', 'offline')),
        timezone VARCHAR(50) DEFAULT 'UTC',
        language VARCHAR(10) DEFAULT 'en',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT true
      );

      -- Projects table
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on-hold', 'completed', 'archived')),
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
        budget DECIMAL(15,2),
        start_date DATE,
        due_date DATE,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        archived_at TIMESTAMP WITH TIME ZONE
      );

      -- Project members (many-to-many relationship)
      CREATE TABLE IF NOT EXISTS project_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'manager', 'member', 'viewer')),
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(project_id, user_id)
      );

      -- Tasks table
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'done', 'blocked')),
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
        estimated_hours DECIMAL(5,2),
        actual_hours DECIMAL(5,2),
        due_date TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Task tags (many-to-many relationship)
      CREATE TABLE IF NOT EXISTS task_tags (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        tag_name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(task_id, tag_name)
      );

      -- Calendar events table
      CREATE TABLE IF NOT EXISTS calendar_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        is_all_day BOOLEAN DEFAULT false,
        event_type VARCHAR(20) DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'deadline', 'milestone', 'event', 'reminder')),
        location VARCHAR(255),
        project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Event attendees (many-to-many relationship)
      CREATE TABLE IF NOT EXISTS event_attendees (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        attendance_status VARCHAR(20) DEFAULT 'pending' CHECK (attendance_status IN ('pending', 'accepted', 'declined', 'tentative')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(event_id, user_id)
      );

      -- Files table
      CREATE TABLE IF NOT EXISTS files (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_type VARCHAR(10) CHECK (file_type IN ('folder', 'file')),
        mime_type VARCHAR(100),
        file_category VARCHAR(20) CHECK (file_category IN ('document', 'image', 'video', 'audio', 'archive', 'other')),
        file_size BIGINT,
        project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
        parent_folder_id UUID REFERENCES files(id) ON DELETE CASCADE,
        uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
        is_shared BOOLEAN DEFAULT false,
        permissions VARCHAR(20) DEFAULT 'view' CHECK (permissions IN ('view', 'edit', 'admin')),
        version_number INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- File tags (many-to-many relationship)
      CREATE TABLE IF NOT EXISTS file_tags (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        file_id UUID REFERENCES files(id) ON DELETE CASCADE,
        tag_name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(file_id, tag_name)
      );

      -- Comments table (for tasks and projects)
      CREATE TABLE IF NOT EXISTS comments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        content TEXT NOT NULL,
        entity_type VARCHAR(20) CHECK (entity_type IN ('task', 'project', 'file')),
        entity_id UUID NOT NULL,
        created_by UUID REFERENCES users(id) ON DELETE SET NULL,
        parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Activity log table
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(20),
        entity_id UUID,
        entity_name VARCHAR(255),
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Notifications table
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        notification_type VARCHAR(20) DEFAULT 'info' CHECK (notification_type IN ('info', 'success', 'warning', 'error')),
        entity_type VARCHAR(20),
        entity_id UUID,
        action_url VARCHAR(500),
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- User settings table
      CREATE TABLE IF NOT EXISTS user_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        email_notifications BOOLEAN DEFAULT true,
        push_notifications BOOLEAN DEFAULT true,
        task_reminders BOOLEAN DEFAULT true,
        project_updates BOOLEAN DEFAULT true,
        team_mentions BOOLEAN DEFAULT true,
        weekly_digest BOOLEAN DEFAULT false,
        theme VARCHAR(10) DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
        compact_mode BOOLEAN DEFAULT false,
        show_avatars BOOLEAN DEFAULT true,
        animations_enabled BOOLEAN DEFAULT true,
        default_view VARCHAR(20) DEFAULT 'dashboard' CHECK (default_view IN ('dashboard', 'projects', 'tasks')),
        items_per_page INTEGER DEFAULT 20,
        auto_save BOOLEAN DEFAULT true,
        show_completed_tasks BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
      CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
      CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(due_date);
      
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
      
      CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
      CREATE INDEX IF NOT EXISTS idx_calendar_events_project_id ON calendar_events(project_id);
      
      CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);
      CREATE INDEX IF NOT EXISTS idx_files_parent_folder_id ON files(parent_folder_id);
      CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files(uploaded_by);
      
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
      
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

      -- Create updated_at trigger function
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Apply updated_at triggers to relevant tables
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
      CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
      CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON calendar_events;
      CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      DROP TRIGGER IF EXISTS update_files_updated_at ON files;
      CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
      CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `)
    
    console.log('Database tables created successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  } finally {
    client.release()
  }
}
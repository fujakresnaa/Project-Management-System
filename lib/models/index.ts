// Type definitions for all database models

export interface User {
  id: string
  name: string
  email: string
  password_hash?: string
  avatar?: string
  role: 'admin' | 'manager' | 'member'
  department?: string
  title?: string
  status: 'online' | 'away' | 'offline'
  timezone: string
  language: string
  created_at: string
  updated_at: string
  last_login?: string
  is_active: boolean
}

export interface Project {
  id: string
  name: string
  description?: string
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  progress: number
  budget?: number
  start_date?: string
  due_date?: string
  created_by?: string
  created_at: string
  updated_at: string
  completed_at?: string
  archived_at?: string
  // Joined fields
  team_members?: User[]
  member_count?: number
  task_count?: number
  completed_task_count?: number
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: 'owner' | 'manager' | 'member' | 'viewer'
  joined_at: string
  // Joined fields
  user?: User
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  project_id?: string
  assigned_to?: string
  created_by?: string
  parent_task_id?: string
  estimated_hours?: number
  actual_hours?: number
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
  // Joined fields
  project?: Project
  assignee?: User
  creator?: User
  parent_task?: Task
  subtasks?: Task[]
  tags?: string[]
  comment_count?: number
}

export interface TaskTag {
  id: string
  task_id: string
  tag_name: string
  created_at: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  event_date: string
  start_time?: string
  end_time?: string
  is_all_day: boolean
  event_type: 'meeting' | 'deadline' | 'milestone' | 'event' | 'reminder'
  location?: string
  project_id?: string
  created_by?: string
  created_at: string
  updated_at: string
  // Joined fields
  project?: Project
  creator?: User
  attendees?: User[]
  attendee_count?: number
}

export interface EventAttendee {
  id: string
  event_id: string
  user_id: string
  attendance_status: 'pending' | 'accepted' | 'declined' | 'tentative'
  created_at: string
  // Joined fields
  user?: User
}

export interface FileItem {
  id: string
  name: string
  original_name: string
  file_path: string
  file_type: 'folder' | 'file'
  mime_type?: string
  file_category?: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other'
  file_size?: number
  project_id?: string
  parent_folder_id?: string
  uploaded_by?: string
  is_shared: boolean
  permissions: 'view' | 'edit' | 'admin'
  version_number: number
  created_at: string
  updated_at: string
  // Joined fields
  project?: Project
  uploader?: User
  parent_folder?: FileItem
  tags?: string[]
}

export interface FileTag {
  id: string
  file_id: string
  tag_name: string
  created_at: string
}

export interface Comment {
  id: string
  content: string
  entity_type: 'task' | 'project' | 'file'
  entity_id: string
  created_by?: string
  parent_comment_id?: string
  created_at: string
  updated_at: string
  // Joined fields
  author?: User
  replies?: Comment[]
}

export interface ActivityLog {
  id: string
  user_id?: string
  action: string
  entity_type?: string
  entity_id?: string
  entity_name?: string
  description?: string
  metadata?: Record<string, any>
  created_at: string
  // Joined fields
  user?: User
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  notification_type: 'info' | 'success' | 'warning' | 'error'
  entity_type?: string
  entity_id?: string
  action_url?: string
  is_read: boolean
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  task_reminders: boolean
  project_updates: boolean
  team_mentions: boolean
  weekly_digest: boolean
  theme: 'light' | 'dark' | 'auto'
  compact_mode: boolean
  show_avatars: boolean
  animations_enabled: boolean
  default_view: 'dashboard' | 'projects' | 'tasks'
  items_per_page: number
  auto_save: boolean
  show_completed_tasks: boolean
  created_at: string
  updated_at: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Dashboard Analytics types
export interface DashboardMetrics {
  total_projects: number
  active_projects: number
  completed_tasks: number
  total_tasks: number
  team_members: number
  upcoming_deadlines: number
  recent_projects: Project[]
  recent_activity: ActivityLog[]
  upcoming_tasks: Task[]
}

// Filter and pagination types
export interface QueryFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  priority?: string
  project_id?: string
  assigned_to?: string
  created_by?: string
  date_from?: string
  date_to?: string
  tag?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// Authentication types
export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role?: string
  department?: string
  title?: string
}
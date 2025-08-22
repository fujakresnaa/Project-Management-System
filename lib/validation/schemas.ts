import { z } from 'zod'

// User validation schemas
export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'manager', 'member']).default('member'),
  department: z.string().min(1, 'Department is required').max(100, 'Department name too long'),
  title: z.string().max(100, 'Title too long').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  timezone: z.string().default('UTC'),
  language: z.string().default('en')
})

export const updateUserSchema = createUserSchema.partial().omit({ password: true })

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

// Project validation schemas
export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(255, 'Project name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long'),
  status: z.enum(['planning', 'active', 'on-hold', 'completed', 'archived']).default('planning'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  progress: z.number().int().min(0).max(100).default(0),
  budget: z.number().positive('Budget must be positive').optional(),
  start_date: z.string().datetime().optional(),
  due_date: z.string().datetime().optional(),
  created_by: z.string().uuid('Invalid user ID')
}).refine(data => {
  if (data.start_date && data.due_date) {
    return new Date(data.start_date) <= new Date(data.due_date)
  }
  return true
}, {
  message: "Start date must be before due date",
  path: ["due_date"]
})

export const updateProjectSchema = createProjectSchema.partial()

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters').max(255, 'Task title too long'),
  description: z.string().min(5, 'Description must be at least 5 characters').max(2000, 'Description too long'),
  status: z.enum(['todo', 'in-progress', 'review', 'done', 'blocked']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  project_id: z.string().uuid('Invalid project ID'),
  assigned_to: z.string().uuid('Invalid user ID').optional(),
  created_by: z.string().uuid('Invalid user ID'),
  parent_task_id: z.string().uuid('Invalid parent task ID').optional(),
  estimated_hours: z.number().positive('Estimated hours must be positive').max(1000, 'Estimated hours too high').optional(),
  actual_hours: z.number().positive('Actual hours must be positive').max(1000, 'Actual hours too high').optional(),
  due_date: z.string().datetime().optional(),
  tags: z.array(z.string().min(1).max(50)).max(10, 'Too many tags').default([])
})

export const updateTaskSchema = createTaskSchema.partial()

// Calendar event validation schemas
export const createCalendarEventSchema = z.object({
  title: z.string().min(2, 'Event title must be at least 2 characters').max(255, 'Event title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  event_date: z.string().datetime('Invalid event date'),
  start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid start time format').optional(),
  end_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid end time format').optional(),
  is_all_day: z.boolean().default(false),
  event_type: z.enum(['meeting', 'deadline', 'milestone', 'event', 'reminder']).default('meeting'),
  location: z.string().max(255, 'Location too long').optional(),
  project_id: z.string().uuid('Invalid project ID').optional(),
  created_by: z.string().uuid('Invalid user ID'),
  attendees: z.array(z.string().uuid()).max(100, 'Too many attendees').default([])
}).refine(data => {
  if (!data.is_all_day && data.start_time && data.end_time) {
    const [startHour, startMin] = data.start_time.split(':').map(Number)
    const [endHour, endMin] = data.end_time.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    return startMinutes < endMinutes
  }
  return true
}, {
  message: "End time must be after start time",
  path: ["end_time"]
})

export const updateCalendarEventSchema = createCalendarEventSchema.partial()

// File validation schemas
export const createFileSchema = z.object({
  name: z.string().min(1, 'File name is required').max(255, 'File name too long'),
  original_name: z.string().min(1, 'Original file name is required').max(255, 'Original file name too long'),
  file_path: z.string().min(1, 'File path is required').max(500, 'File path too long'),
  file_type: z.enum(['folder', 'file']).default('file'),
  mime_type: z.string().max(100, 'MIME type too long').optional(),
  file_category: z.enum(['document', 'image', 'video', 'audio', 'archive', 'other']).default('other'),
  file_size: z.number().int().positive('File size must be positive').max(1073741824, 'File too large (max 1GB)').optional(), // 1GB
  project_id: z.string().uuid('Invalid project ID').optional(),
  parent_folder_id: z.string().uuid('Invalid folder ID').optional(),
  uploaded_by: z.string().uuid('Invalid user ID'),
  is_shared: z.boolean().default(false),
  permissions: z.enum(['view', 'edit', 'admin']).default('view'),
  tags: z.array(z.string().min(1).max(50)).max(20, 'Too many tags').default([])
})

export const updateFileSchema = createFileSchema.partial()

// Comment validation schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(2000, 'Comment too long'),
  entity_type: z.enum(['task', 'project', 'file']),
  entity_id: z.string().uuid('Invalid entity ID'),
  created_by: z.string().uuid('Invalid user ID'),
  parent_comment_id: z.string().uuid('Invalid parent comment ID').optional()
})

// Query validation schemas
export const queryFiltersSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().max(255).optional(),
  sort_by: z.string().max(50).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
  status: z.string().max(50).optional(),
  priority: z.string().max(50).optional(),
  project_id: z.string().uuid().optional(),
  assigned_to: z.string().uuid().optional(),
  created_by: z.string().uuid().optional(),
  department: z.string().max(100).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional()
})

// Export validation helper
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}
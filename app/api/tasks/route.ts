import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/services/TaskService'
import { authMiddleware } from '@/lib/middleware/auth'
import { queryFiltersSchema, validateData } from '@/lib/validation/schemas'

const taskService = new TaskService()

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      project_id: searchParams.get('project_id') || undefined,
      assigned_to: searchParams.get('assigned_to') || undefined,
      created_by: searchParams.get('created_by') || undefined,
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc'
    }

    const validation = validateData(queryFiltersSchema, filters)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid filters',
        errors: validation.errors
      }, { status: 400 })
    }

    const result = await taskService.getTasks(validation.data)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: result.data?.tasks,
      pagination: {
        page: validation.data.page,
        limit: validation.data.limit,
        total: result.data?.total || 0,
        totalPages: Math.ceil((result.data?.total || 0) / validation.data.limit)
      },
      metrics: result.data?.metrics
    })

  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = await taskService.createTask(body, authResult.user!.userId)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })

  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
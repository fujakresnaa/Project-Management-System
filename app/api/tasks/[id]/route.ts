import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from '@/lib/services/TaskService'
import { authMiddleware } from '@/lib/middleware/auth'

const taskService = new TaskService()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const result = await taskService.getTask(params.id)

    if (!result.success) {
      return NextResponse.json(result, { status: result.errors?.includes('not found') ? 404 : 400 })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Get task error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const result = await taskService.updateTask(params.id, body, authResult.user!.userId)

    if (!result.success) {
      return NextResponse.json(result, { status: result.errors?.includes('not found') ? 404 : 400 })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const result = await taskService.deleteTask(params.id, authResult.user!.userId)

    if (!result.success) {
      return NextResponse.json(result, { status: result.errors?.includes('not found') ? 404 : 400 })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}